"""
Report Routes — Generate and download clinical reports using Gemini API
"""

from flask import Blueprint, request, jsonify, send_file
from services.auth_middleware import token_required
from services.report_service import generate_clinical_report
import os
from config import Config

report_bp = Blueprint('report', __name__)


@report_bp.route('/generate', methods=['POST'])
@token_required
def generate_report(current_user):
    """Generate clinical report using Gemini API."""
    from models.db_models import (
        Patient, CognitiveAssessment, ClinicalAssessment,
        MRIResult, FusionResult
    )
    from extensions import db

    patient_id = current_user['user_id']
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404

    # Gather all data
    mmse = CognitiveAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(CognitiveAssessment.assessment_date.desc()).first()
    clinical = ClinicalAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(ClinicalAssessment.assessment_date.desc()).first()
    mri = MRIResult.query.filter_by(patient_id=patient_id)\
        .order_by(MRIResult.created_at.desc()).first()
    fusion = FusionResult.query.filter_by(patient_id=patient_id)\
        .order_by(FusionResult.created_at.desc()).first()

    # Build context for report generation
    context = {
        'patient_name': patient.name,
        'patient_dob': patient.dob.isoformat() if patient.dob else 'N/A',
        'patient_gender': patient.gender,
        'mmse_total': mmse.mmse_total if mmse else 'N/A',
        'faq_score': clinical.faq_score if clinical else 'N/A',
        'clinical_prediction': fusion.final_prediction if fusion else 'N/A',
        'mri_prediction': mri.prediction if mri else 'N/A',
        'fusion_prediction': fusion.final_prediction if fusion else 'N/A',
        'cn_probability': fusion.cn_probability if fusion else 0,
        'mci_probability': fusion.mci_probability if fusion else 0,
        'ad_probability': fusion.ad_probability if fusion else 0,
    }

    # Generate report using Gemini API
    report = generate_clinical_report(context)

    # Save report text to fusion result
    if fusion:
        fusion.report_text = str(report)
        db.session.commit()

    return jsonify({
        'id': fusion.id if fusion else 'demo',
        'sections': report,
    }), 200


@report_bp.route('/download/<report_id>', methods=['GET'])
@token_required
def download_report(current_user, report_id):
    """Download report as PDF (placeholder)."""
    # In production, generate PDF from report text
    return jsonify({
        'message': 'PDF generation will be available after full integration'
    }), 200
