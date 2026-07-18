"""
Explainability Routes — SHAP and Grad-CAM endpoints
"""

from flask import Blueprint, request, jsonify
from services.auth_middleware import token_required
from services.xai_service import get_shap_explanation, get_gradcam_heatmap

explain_bp = Blueprint('explain', __name__)


@explain_bp.route('/shap', methods=['POST'])
@token_required
def shap_explanation(current_user):
    """Get SHAP feature importance for clinical prediction."""
    from models.db_models import CognitiveAssessment, ClinicalAssessment

    patient_id = current_user['user_id']

    mmse = CognitiveAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(CognitiveAssessment.assessment_date.desc()).first()
    clinical = ClinicalAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(ClinicalAssessment.assessment_date.desc()).first()

    if not mmse or not clinical:
        return jsonify({'message': 'Assessments required'}), 400

    features = {
        'AGE': clinical.age,
        'PTGENDER': 1 if clinical.gender == 'Male' else 2,
        'PTEDUCAT': clinical.education,
        'MMSE': mmse.mmse_total,
        'FAQ': clinical.faq_score,
    }

    result = get_shap_explanation(features)
    return jsonify(result), 200


@explain_bp.route('/gradcam', methods=['POST'])
@token_required
def gradcam_explanation(current_user):
    """Get Grad-CAM heatmap for MRI prediction."""
    from models.db_models import MRIResult

    patient_id = current_user['user_id']

    mri = MRIResult.query.filter_by(patient_id=patient_id)\
        .order_by(MRIResult.created_at.desc()).first()

    if not mri or not mri.image_path:
        return jsonify({'message': 'MRI result not found', 'heatmap_url': None}), 200

    result = get_gradcam_heatmap(mri.image_path, mri.id)

    if result.get('gradcam_path'):
        mri.gradcam_path = result['gradcam_path']
        from extensions import db
        db.session.commit()

    return jsonify(result), 200
