"""
Prediction Routes — Clinical ML, MRI Deep Learning, and Fusion predictions
"""

from flask import Blueprint, request, jsonify
from services.auth_middleware import token_required
from services.ml_service import (
    predict_clinical,
    predict_mri,
    predict_fusion,
)
import os
from werkzeug.utils import secure_filename
from config import Config

prediction_bp = Blueprint('prediction', __name__)
clinical_bp = Blueprint('clinical', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'nii', 'gz'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@prediction_bp.route('/clinical', methods=['POST'])
@token_required
def clinical_prediction(current_user):
    """
    Run clinical model prediction.
    Input: AGE, PTGENDER, PTEDUCAT, MMSE, FAQ
    Output: CN/MCI/AD probabilities + prediction
    """
    from extensions import db
    from models.db_models import CognitiveAssessment, ClinicalAssessment

    data = request.get_json()
    patient_id = current_user['user_id']

    # Get latest assessments to extract features
    mmse = CognitiveAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(CognitiveAssessment.assessment_date.desc()).first()
    clinical = ClinicalAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(ClinicalAssessment.assessment_date.desc()).first()

    if not mmse or not clinical:
        return jsonify({'message': 'Complete MMSE and Clinical assessments first'}), 400

    # Prepare features for model
    features = {
        'AGE': clinical.age,
        'PTGENDER': 1 if clinical.gender == 'Male' else 2,
        'PTEDUCAT': clinical.education,
        'MMSE': mmse.mmse_total,
        'FAQ': clinical.faq_score,
    }

    # Get prediction from ML model
    result = predict_clinical(features)

    return jsonify({
        'cn_probability': result['cn_probability'],
        'mci_probability': result['mci_probability'],
        'ad_probability': result['ad_probability'],
        'prediction': result['prediction'],
        'recommendation': result['recommendation'],
    }), 200


@prediction_bp.route('/mri', methods=['POST'])
@token_required
def mri_prediction(current_user):
    """
    Run MRI model prediction.
    Input: MRI Image file
    Output: CN/MCI/AD probabilities + prediction
    """
    from extensions import db
    from models.db_models import MRIResult

    if 'mri_image' not in request.files:
        return jsonify({'message': 'No MRI image provided'}), 400

    file = request.files['mri_image']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(f"{current_user['user_id']}_{file.filename}")
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Get prediction from DL model
        result = predict_mri(filepath)

        # Save result to database
        mri_result = MRIResult(
            patient_id=current_user['user_id'],
            image_path=filepath,
            cn_probability=result['cn_probability'],
            mci_probability=result['mci_probability'],
            ad_probability=result['ad_probability'],
            prediction=result['prediction'],
        )
        db.session.add(mri_result)
        db.session.commit()

        return jsonify({
            'cn_probability': result['cn_probability'],
            'mci_probability': result['mci_probability'],
            'ad_probability': result['ad_probability'],
            'prediction': result['prediction'],
            'mri_id': mri_result.id,
        }), 200

    return jsonify({'message': 'Invalid file type'}), 400


@prediction_bp.route('/fusion', methods=['POST'])
@token_required
def fusion_prediction(current_user):
    """
    Decision-level fusion of clinical + MRI predictions.
    Output: Final prediction (Healthy / MCI / Alzheimer's Disease)
    """
    from extensions import db
    from models.db_models import MRIResult, ClinicalAssessment, CognitiveAssessment, FusionResult

    patient_id = current_user['user_id']

    # Get latest predictions
    mmse = CognitiveAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(CognitiveAssessment.assessment_date.desc()).first()
    clinical = ClinicalAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(ClinicalAssessment.assessment_date.desc()).first()
    mri = MRIResult.query.filter_by(patient_id=patient_id)\
        .order_by(MRIResult.created_at.desc()).first()

    if not clinical or not mmse:
        return jsonify({'message': 'Clinical assessment required'}), 400

    # Get clinical prediction
    clinical_features = {
        'AGE': clinical.age,
        'PTGENDER': 1 if clinical.gender == 'Male' else 2,
        'PTEDUCAT': clinical.education,
        'MMSE': mmse.mmse_total,
        'FAQ': clinical.faq_score,
    }
    clinical_result = predict_clinical(clinical_features)

    # Get MRI prediction if available
    mri_result = None
    if mri:
        mri_result = {
            'cn_probability': mri.cn_probability,
            'mci_probability': mri.mci_probability,
            'ad_probability': mri.ad_probability,
        }

    # Fusion
    fusion = predict_fusion(
        clinical_probs={
            'cn': clinical_result['cn_probability'],
            'mci': clinical_result['mci_probability'],
            'ad': clinical_result['ad_probability'],
        },
        mri_probs={
            'cn': mri_result['cn_probability'] if mri_result else 0,
            'mci': mri_result['mci_probability'] if mri_result else 0,
            'ad': mri_result['ad_probability'] if mri_result else 0,
        } if mri_result else None,
    )

    # Save fusion result
    fusion_result = FusionResult(
        patient_id=patient_id,
        clinical_id=clinical.id,
        mri_id=mri.id if mri else None,
        cn_probability=fusion['cn_probability'],
        mci_probability=fusion['mci_probability'],
        ad_probability=fusion['ad_probability'],
        final_prediction=fusion['prediction'],
    )
    db.session.add(fusion_result)
    db.session.commit()

    return jsonify({
        'cn_probability': fusion['cn_probability'],
        'mci_probability': fusion['mci_probability'],
        'ad_probability': fusion['ad_probability'],
        'final_prediction': fusion['prediction'],
    }), 200


@clinical_bp.route('/predict', methods=['POST'])
@token_required
def predict_clinical_api(current_user):
    """
    Run XGBoost clinical prediction and save result.
    POST /api/clinical/predict
    """
    from extensions import db
    from models.db_models import ClinicalAssessment

    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400

    # Get inputs
    patient_id = data.get('patient_id')
    age = data.get('age')
    gender = data.get('gender')
    education = data.get('education')
    mmse = data.get('mmse')
    faq = data.get('faq')

    # Validation
    if patient_id is None:
        return jsonify({'message': 'patient_id is required'}), 400

    if age is None or not isinstance(age, (int, float)) or age <= 0:
        return jsonify({'message': 'Age must be a number greater than 0'}), 400

    if education is None or not isinstance(education, (int, float)) or education < 0:
        return jsonify({'message': 'Education must be a number greater than or equal to 0'}), 400

    if mmse is None or not isinstance(mmse, (int, float)) or not (0 <= mmse <= 30):
        return jsonify({'message': 'MMSE score must be between 0 and 30'}), 400

    if faq is None or not isinstance(faq, (int, float)) or not (0 <= faq <= 30):
        return jsonify({'message': 'FAQ score must be between 0 and 30'}), 400

    if gender not in ['Male', 'Female']:
        return jsonify({'message': 'Gender must be Male or Female'}), 400

    # Prepare features for model (support both uppercase and lowercase)
    features = {
        'AGE': age,
        'PTGENDER': gender,
        'PTEDUCAT': education,
        'MMSE': mmse,
        'FAQ': faq
    }

    try:
        result = predict_clinical(features)
    except Exception as e:
        return jsonify({'message': f'Prediction execution failed: {str(e)}'}), 500

    # Automatically save clinical prediction details to the DB table
    try:
        assessment = ClinicalAssessment(
            patient_id=int(patient_id),
            age=int(age),
            gender=gender,
            education=int(education),
            faq_score=int(faq),
            mmse_score=int(mmse),
            prediction=result['prediction'],
            cn_probability=result['cn_probability'],
            mci_probability=result['mci_probability'],
            ad_probability=result['ad_probability']
        )
        db.session.add(assessment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database save failed: {str(e)}'}), 500

    return jsonify({
        'prediction': result['prediction'],
        'probabilities': {
            'AD': result['ad_probability'],
            'CN': result['cn_probability'],
            'MCI': result['mci_probability']
        }
    }), 200
