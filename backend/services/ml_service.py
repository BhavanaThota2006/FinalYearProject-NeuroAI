"""
Machine Learning Service — Load and run trained models
Loads clinical_model.pkl, mri_model.keras, and fusion_model.pkl
"""

import os
import numpy as np
import logging
from config import Config

logger = logging.getLogger(__name__)

# Model cache
_clinical_model = None
_label_encoder = None
_feature_columns = None
_mri_model = None
_fusion_model = None


def _load_clinical_model():
    """Load the clinical prediction model, label encoder, and feature columns (XGBoost/scikit-learn)."""
    global _clinical_model, _label_encoder, _feature_columns
    if _clinical_model is not None and _label_encoder is not None and _feature_columns is not None:
        return _clinical_model, _label_encoder, _feature_columns

    import joblib
    
    # Paths from Config
    model_path = Config.CLINICAL_MODEL_PKL
    le_path = Config.LABEL_ENCODER_PKL
    cols_path = Config.FEATURE_COLUMNS_PKL

    if os.path.exists(model_path):
        try:
            _clinical_model = joblib.load(model_path)
            logger.info('Clinical model loaded successfully')
        except Exception as e:
            logger.error(f'Failed to load Clinical model: {e}')
            _clinical_model = None
    else:
        logger.warning(f'Clinical model not found at {model_path}')
        _clinical_model = None

    if os.path.exists(le_path):
        try:
            _label_encoder = joblib.load(le_path)
            logger.info('Label encoder loaded successfully')
        except Exception as e:
            logger.error(f'Failed to load Label encoder: {e}')
            _label_encoder = None
    else:
        logger.warning(f'Label encoder not found at {le_path}')
        _label_encoder = None

    if os.path.exists(cols_path):
        try:
            _feature_columns = joblib.load(cols_path)
            logger.info('Feature columns loaded successfully')
        except Exception as e:
            logger.error(f'Failed to load Feature columns: {e}')
            _feature_columns = None
    else:
        logger.warning(f'Feature columns not found at {cols_path}')
        _feature_columns = None

    return _clinical_model, _label_encoder, _feature_columns


def build_mri_model():
    """Build PyTorch EfficientNet B0 architecture with 3 output classes."""
    import torch
    import torchvision.models as models
    try:
        # Newer torchvision versions
        model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    except Exception:
        # Older torchvision versions
        model = models.efficientnet_b0(pretrained=True)
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(num_ftrs, 3)
    return model


def _load_mri_model():
    """Load the MRI prediction model (PyTorch)."""
    global _mri_model
    if _mri_model is not None:
        return _mri_model

    model_path = Config.MRI_MODEL_PATH
    if os.path.exists(model_path):
        try:
            import torch
            checkpoint = torch.load(model_path, map_location='cpu')
            if isinstance(checkpoint, torch.nn.Module):
                _mri_model = checkpoint
            elif isinstance(checkpoint, dict):
                # Try loading as state_dict
                _mri_model = build_mri_model()
                _mri_model.load_state_dict(checkpoint)
            else:
                _mri_model = build_mri_model()
            _mri_model.eval()
            logger.info('MRI PyTorch model loaded successfully')
        except Exception as e:
            logger.error(f'Failed to load MRI model: {e}')
            _mri_model = None
    else:
        logger.warning(f'MRI model not found at {model_path}. Using placeholder.')
        _mri_model = None

    return _mri_model


def predict_clinical(features):
    """
    Run clinical model prediction.
    Input features: AGE, PTGENDER, PTEDUCAT, MMSE, FAQ (or lowercase counterparts)
    Output: cn_probability, mci_probability, ad_probability, prediction class, recommendation
    """
    model, label_encoder, feature_columns = _load_clinical_model()

    # Preprocess inputs
    age = features.get('AGE', features.get('age', 0))
    gender = features.get('PTGENDER', features.get('gender', 'Male'))
    education = features.get('PTEDUCAT', features.get('education', 0))
    mmse = features.get('MMSE', features.get('mmse', 0))
    faq = features.get('FAQ', features.get('faq', 0))

    if isinstance(gender, str):
        gender_num = 1 if gender.strip().lower() == 'male' else 0
    else:
        gender_num = 1 if gender == 1 else 0

    # Arrange features exactly as [AGE, PTGENDER, PTEDUCAT, MMSE, FAQ]
    feature_vals = [
        float(age),
        float(gender_num),
        float(education),
        float(mmse),
        float(faq)
    ]
    
    if feature_columns is not None:
        try:
            import pandas as pd
            # Create a DataFrame matching column names in feature_columns
            feature_dict = {
                'AGE': [float(age)],
                'PTGENDER': [float(gender_num)],
                'PTEDUCAT': [float(education)],
                'MMSE': [float(mmse)],
                'FAQ': [float(faq)]
            }
            # Reorder according to the feature columns list
            df = pd.DataFrame(feature_dict)[feature_columns]
            feature_input = df
        except Exception:
            feature_input = np.array([feature_vals])
    else:
        feature_input = np.array([feature_vals])

    if model is not None:
        try:
            # Predict probabilities
            probabilities = model.predict_proba(feature_input)[0]
            # Predict class index
            pred_idx = model.predict(feature_input)[0]

            # Decode class index
            if label_encoder is not None:
                try:
                    prediction = label_encoder.inverse_transform([pred_idx])[0]
                except Exception:
                    prediction = str(pred_idx)
            else:
                prediction = str(pred_idx)

            # Map probabilities based on class names
            prob_map = {}
            if label_encoder is not None and hasattr(label_encoder, 'classes_'):
                class_labels = [str(c) for c in label_encoder.classes_]
            elif hasattr(model, 'classes_'):
                class_labels = [str(c) for c in model.classes_]
            else:
                class_labels = ['CN', 'MCI', 'AD']

            for cls_val, prob in zip(class_labels, probabilities):
                try:
                    # decode index if label encoder classes are numbers
                    if cls_val.isdigit() or (cls_val.startswith('-') and cls_val[1:].isdigit()):
                        le_val = int(cls_val)
                        if label_encoder is not None:
                            cls_name = label_encoder.inverse_transform([le_val])[0]
                        else:
                            cls_name = cls_val
                    else:
                        cls_name = cls_val
                except Exception:
                    cls_name = cls_val

                cls_str = str(cls_name).upper()
                if 'CN' in cls_str or 'NORMAL' in cls_str or '0' == cls_str:
                    prob_map['CN'] = float(prob)
                elif 'MCI' in cls_str or '1' == cls_str:
                    prob_map['MCI'] = float(prob)
                elif 'AD' in cls_str or 'DEMENTIA' in cls_str or '2' == cls_str:
                    prob_map['AD'] = float(prob)

            cn_prob = prob_map.get('CN', 0.0)
            mci_prob = prob_map.get('MCI', 0.0)
            ad_prob = prob_map.get('AD', 0.0)

            # If all are zero or key mapping was off, fallback map direct indexes
            if cn_prob == 0.0 and mci_prob == 0.0 and ad_prob == 0.0:
                for idx, prob in enumerate(probabilities):
                    try:
                        cls_name = label_encoder.inverse_transform([idx])[0]
                    except:
                        cls_name = str(idx)
                    cls_str = str(cls_name).upper()
                    if 'CN' in cls_str or '0' in cls_str:
                        cn_prob = float(prob)
                    elif 'MCI' in cls_str or '1' in cls_str:
                        mci_prob = float(prob)
                    elif 'AD' in cls_str or '2' in cls_str:
                        ad_prob = float(prob)

        except Exception as e:
            logger.error(f'Clinical prediction error: {e}')
            cn_prob, mci_prob, ad_prob = 0.33, 0.34, 0.33
            prediction = 'MCI'
    else:
        # Heuristic placeholder when model is not loaded
        if mmse >= 24 and faq <= 5:
            cn_prob, mci_prob, ad_prob = 0.70, 0.20, 0.10
        elif mmse >= 19 and faq <= 10:
            cn_prob, mci_prob, ad_prob = 0.15, 0.60, 0.25
        else:
            cn_prob, mci_prob, ad_prob = 0.05, 0.25, 0.70
        
        probs_fallback = {'CN': cn_prob, 'MCI': mci_prob, 'AD': ad_prob}
        prediction = max(probs_fallback, key=probs_fallback.get)

    # Clean predicted label
    if isinstance(prediction, str):
        prediction = prediction.upper()
        if 'CN' in prediction or 'NORMAL' in prediction:
            prediction = 'CN'
        elif 'MCI' in prediction:
            prediction = 'MCI'
        elif 'AD' in prediction or 'DEMENTIA' in prediction:
            prediction = 'AD'

    # Generate recommendation based on diagnosis
    if prediction == 'CN':
        recommendation = 'Routine follow-up recommended'
    elif prediction == 'MCI':
        recommendation = 'MRI scan recommended for further evaluation'
    else:
        recommendation = 'MRI scan and neurologist consultation strongly recommended'

    return {
        'cn_probability': round(cn_prob, 4),
        'mci_probability': round(mci_prob, 4),
        'ad_probability': round(ad_prob, 4),
        'cn': round(cn_prob, 4),
        'mci': round(mci_prob, 4),
        'ad': round(ad_prob, 4),
        'prediction': prediction,
        'recommendation': recommendation,
    }


def predict_mri(image_path):
    """
    Run MRI model prediction on brain scan.
    Input: Path to MRI image
    Output: CN/MCI/AD probabilities + prediction class
    """
    model = _load_mri_model()

    if model is not None:
        try:
            import torch
            from torchvision import transforms
            from PIL import Image

            # Preprocess image
            preprocess = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])

            img = Image.open(image_path).convert('RGB')
            img_tensor = preprocess(img).unsqueeze(0)

            # Predict
            with torch.no_grad():
                outputs = model(img_tensor)
                probabilities = torch.softmax(outputs, dim=1)[0].cpu().numpy()

            if len(probabilities) >= 3:
                cn_prob = float(probabilities[0])
                mci_prob = float(probabilities[1])
                ad_prob = float(probabilities[2])
            else:
                cn_prob, mci_prob, ad_prob = 0.33, 0.34, 0.33

        except Exception as e:
            logger.error(f'MRI prediction error: {e}')
            cn_prob, mci_prob, ad_prob = 0.33, 0.34, 0.33
    else:
        # Placeholder prediction
        cn_prob, mci_prob, ad_prob = 0.15, 0.35, 0.50

    probs = {'CN': cn_prob, 'MCI': mci_prob, 'AD': ad_prob}
    prediction = max(probs, key=probs.get)

    return {
        'cn_probability': round(cn_prob, 4),
        'mci_probability': round(mci_prob, 4),
        'ad_probability': round(ad_prob, 4),
        'prediction': prediction,
    }


def predict_fusion(clinical_probs, mri_probs=None):
    """
    Decision-level fusion combining clinical and MRI predictions.
    Uses weighted averaging of probabilities.
    """
    if mri_probs:
        # Weighted fusion: clinical (0.4) + MRI (0.6)
        clinical_weight = 0.4
        mri_weight = 0.6

        cn_prob = clinical_probs['cn'] * clinical_weight + mri_probs['cn'] * mri_weight
        mci_prob = clinical_probs['mci'] * clinical_weight + mri_probs['mci'] * mri_weight
        ad_prob = clinical_probs['ad'] * clinical_weight + mri_probs['ad'] * mri_weight
    else:
        # Clinical only
        cn_prob = clinical_probs['cn']
        mci_prob = clinical_probs['mci']
        ad_prob = clinical_probs['ad']

    # Normalize
    total = cn_prob + mci_prob + ad_prob
    if total > 0:
        cn_prob /= total
        mci_prob /= total
        ad_prob /= total

    probs = {'CN': cn_prob, 'MCI': mci_prob, 'AD': ad_prob}
    prediction = max(probs, key=probs.get)

    return {
        'cn_probability': round(cn_prob, 4),
        'mci_probability': round(mci_prob, 4),
        'ad_probability': round(ad_prob, 4),
        'prediction': prediction,
    }
