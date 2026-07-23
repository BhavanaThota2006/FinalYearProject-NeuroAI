"""
Doctor Routes — Search patients and view patient details
"""

from flask import Blueprint, request, jsonify
from services.auth_middleware import token_required
from extensions import db

doctor_bp = Blueprint('doctor', __name__)


@doctor_bp.route('/search', methods=['GET'])
@token_required
def search_patients(current_user):
    """Search patients by name, email, or patient ID."""
    from models.db_models import Patient

    query = request.args.get('q', '')
    if not query:
        return jsonify({'patients': []}), 200

    filters = [
        Patient.name.ilike(f'%{query}%'),
        Patient.email.ilike(f'%{query}%'),
    ]
    # Support numeric patient ID search
    if query.isdigit():
        filters.append(Patient.id == int(query))

    patients = Patient.query.filter(
        db.or_(*filters)
    ).limit(20).all()

    return jsonify({
        'patients': [{
            'id': p.id,
            'name': p.name,
            'email': p.email,
            'dob': p.dob.isoformat() if p.dob else None,
            'gender': p.gender,
            'phone': p.phone,
        } for p in patients]
    }), 200


@doctor_bp.route('/patients', methods=['GET'])
@token_required
def list_all_patients(current_user):
    """List all patients with pagination and sorting."""
    from models.db_models import Patient, CognitiveAssessment

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')

    # Validate sort column
    sort_columns = {
        'name': Patient.name,
        'email': Patient.email,
        'created_at': Patient.created_at,
        'id': Patient.id,
    }
    sort_col = sort_columns.get(sort_by, Patient.created_at)
    if sort_order == 'asc':
        sort_col = sort_col.asc()
    else:
        sort_col = sort_col.desc()

    pagination = Patient.query.order_by(sort_col).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'patients': [{
            'id': p.id,
            'name': p.name,
            'email': p.email,
            'dob': p.dob.isoformat() if p.dob else None,
            'gender': p.gender,
            'phone': p.phone,
            'created_at': p.created_at.isoformat() if p.created_at else None,
        } for p in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page,
        'per_page': pagination.per_page,
    }), 200


@doctor_bp.route('/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    """Get dashboard statistics for doctor."""
    from models.db_models import Patient, CognitiveAssessment, ClinicalAssessment
    from datetime import datetime, timedelta

    total_patients = Patient.query.count()
    today = datetime.utcnow().date()
    assessments_today = CognitiveAssessment.query.filter(
        db.func.date(CognitiveAssessment.assessment_date) == today
    ).count() + ClinicalAssessment.query.filter(
        db.func.date(ClinicalAssessment.assessment_date) == today
    ).count()

    # Patients registered in the last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_patients = Patient.query.filter(Patient.created_at >= week_ago).count()

    return jsonify({
        'total_patients': total_patients,
        'assessments_today': assessments_today,
        'new_patients_week': new_patients,
    }), 200


@doctor_bp.route('/patient/<int:patient_id>', methods=['GET'])
@token_required
def get_patient_detail(current_user, patient_id):
    """Get full patient detail with all assessments and predictions."""
    from models.db_models import (
        Patient, CognitiveAssessment, ClinicalAssessment,
        MRIResult, FusionResult, ExerciseResult
    )
    from services.ml_service import predict_clinical
    from services.xai_service import get_shap_explanation

    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404

    # Get latest records
    mmse = CognitiveAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(CognitiveAssessment.assessment_date.desc()).first()
    clinical = ClinicalAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(ClinicalAssessment.assessment_date.desc()).first()
    mri = MRIResult.query.filter_by(patient_id=patient_id)\
        .order_by(MRIResult.created_at.desc()).first()
    fusion = FusionResult.query.filter_by(patient_id=patient_id)\
        .order_by(FusionResult.created_at.desc()).first()
    exercise = ExerciseResult.query.filter_by(patient_id=patient_id)\
        .order_by(ExerciseResult.completion_date.desc()).first()

    result = {
        'patient': {
            'id': patient.id, 'name': patient.name, 'email': patient.email,
            'dob': patient.dob.isoformat() if patient.dob else None,
            'gender': patient.gender, 'phone': patient.phone,
        },
    }

    # MMSE results defaults
    result['mmse'] = {
        'orientation': 0, 'registration': 0, 'attention': 0, 'recall': 0,
        'language': 0, 'visuospatial': 0, 'total': 0, 'date': None
    }
    if mmse:
        result['mmse'] = {
            'orientation': mmse.orientation_score, 'registration': mmse.registration_score,
            'attention': mmse.attention_score, 'recall': mmse.recall_score,
            'language': mmse.language_score, 'visuospatial': mmse.visuospatial_score,
            'total': mmse.mmse_total, 'date': mmse.assessment_date.isoformat(),
        }

    # Clinical prediction defaults
    cn_prob, mci_prob, ad_prob, prediction = 0.0, 0.0, 0.0, 'CN'
    result['clinical'] = {
        'age': 0, 'gender': 'Male', 'education': 0, 'faq_score': 0,
        'cn_prob': cn_prob, 'mci_prob': mci_prob, 'ad_prob': ad_prob,
        'prediction': prediction, 'date': None
    }
    if clinical:
        if clinical.prediction is not None:
            cn_prob = clinical.cn_probability
            mci_prob = clinical.mci_probability
            ad_prob = clinical.ad_probability
            prediction = clinical.prediction
        elif mmse:
            features = {
                'AGE': clinical.age,
                'PTGENDER': clinical.gender,
                'PTEDUCAT': clinical.education,
                'MMSE': mmse.mmse_total,
                'FAQ': clinical.faq_score,
            }
            try:
                pred = predict_clinical(features)
                cn_prob = pred['cn_probability']
                mci_prob = pred['mci_probability']
                ad_prob = pred['ad_probability']
                prediction = pred['prediction']
            except Exception:
                pass
        result['clinical'] = {
            'age': clinical.age, 'gender': clinical.gender,
            'education': clinical.education, 'faq_score': clinical.faq_score,
            'cn_prob': cn_prob, 'mci_prob': mci_prob, 'ad_prob': ad_prob,
            'prediction': prediction, 'date': clinical.assessment_date.isoformat(),
        }

    # MRI results defaults
    result['mri'] = {
        'cn_prob': 0.0, 'mci_prob': 0.0, 'ad_prob': 0.0, 'prediction': 'CN',
        'gradcam_url': None, 'date': None
    }
    if mri:
        result['mri'] = {
            'cn_prob': mri.cn_probability, 'mci_prob': mri.mci_probability,
            'ad_prob': mri.ad_probability, 'prediction': mri.prediction,
            'gradcam_url': f'/api/explain/gradcam/image/{mri.id}' if mri.gradcam_path else None,
            'date': mri.created_at.isoformat(),
        }

    # Fusion results defaults
    result['fusion'] = {
        'cn_prob': 0.0, 'mci_prob': 0.0, 'ad_prob': 0.0, 'prediction': 'CN',
        'date': None
    }
    if fusion:
        result['fusion'] = {
            'cn_prob': fusion.cn_probability, 'mci_prob': fusion.mci_probability,
            'ad_prob': fusion.ad_probability, 'prediction': fusion.final_prediction,
            'date': fusion.created_at.isoformat(),
        }

    # Exercise results defaults
    result['exercise'] = {
        'type': 'N/A', 'score': 0, 'date': None
    }
    if exercise:
        result['exercise'] = {
            'type': exercise.exercise_type, 'score': exercise.score,
            'date': exercise.completion_date.isoformat(),
        }

    # SHAP explanations defaults
    shap_data = {
        'features': ['MMSE', 'FAQ', 'AGE', 'PTEDUCAT', 'PTGENDER'],
        'importance': [0.0, 0.0, 0.0, 0.0, 0.0]
    }
    if clinical and mmse:
        features = {
            'AGE': clinical.age,
            'PTGENDER': 1 if clinical.gender == 'Male' else 2,
            'PTEDUCAT': clinical.education,
            'MMSE': mmse.mmse_total,
            'FAQ': clinical.faq_score,
        }
        try:
            shap_data = get_shap_explanation(features)
        except Exception:
            pass
    result['shap'] = shap_data

    return jsonify(result), 200
