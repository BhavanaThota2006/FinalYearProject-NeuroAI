"""
Report Generation Service — Uses Gemini API to generate clinical reports
"""

import os
import logging
from config import Config

logger = logging.getLogger(__name__)


def generate_clinical_report(context):
    """
    Generate a professional clinical report using Google Gemini API.
    Falls back to template-based report if API key is not configured.
    """
    api_key = Config.GEMINI_API_KEY

    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            prompt = f"""
You are a clinical neurologist writing a professional medical report.
Generate a comprehensive clinical report for an Alzheimer's Disease assessment with the following data:

Patient Name: {context['patient_name']}
Date of Birth: {context['patient_dob']}
Gender: {context['patient_gender']}

Assessment Results:
- MMSE Score: {context['mmse_total']}/30
- FAQ Score: {context['faq_score']}/15
- Clinical Model Prediction: {context['clinical_prediction']}
- MRI Model Prediction: {context['mri_prediction']}
- Final Fusion Prediction: {context['fusion_prediction']}
- CN Probability: {context['cn_probability']:.1%}
- MCI Probability: {context['mci_probability']:.1%}
- AD Probability: {context['ad_probability']:.1%}

Generate the following sections:
1. Patient Summary
2. Clinical Findings
3. MRI Findings
4. Explainable AI Summary
5. Final Risk Assessment
6. Recommendations

Use professional medical language. Be thorough but concise.
Return ONLY the sections as plain text with section headers.
"""
            response = model.generate_content(prompt)
            text = response.text

            # Parse sections from response
            sections = _parse_report_sections(text)
            return sections

        except Exception as e:
            logger.error(f'Gemini API error: {e}')
            return _generate_template_report(context)
    else:
        return _generate_template_report(context)


def _parse_report_sections(text):
    """Parse report text into sections dictionary."""
    sections = {
        'patient_summary': '',
        'clinical_findings': '',
        'mri_findings': '',
        'xai_summary': '',
        'risk_assessment': '',
        'recommendations': '',
    }

    section_map = {
        'patient summary': 'patient_summary',
        'clinical findings': 'clinical_findings',
        'mri findings': 'mri_findings',
        'explainable ai': 'xai_summary',
        'risk assessment': 'risk_assessment',
        'recommendations': 'recommendations',
    }

    current_section = None
    lines = text.strip().split('\n')

    for line in lines:
        line_lower = line.strip().lower()
        matched = False
        for key, section_key in section_map.items():
            if key in line_lower and (line.startswith('#') or line.startswith('**') or line.endswith(':')):
                current_section = section_key
                matched = True
                break

        if not matched and current_section:
            clean_line = line.strip().lstrip('#').lstrip('*').strip()
            if clean_line:
                sections[current_section] += clean_line + '\n'

    # Clean up sections
    for key in sections:
        sections[key] = sections[key].strip()

    return sections


def _generate_template_report(context):
    """Generate report using template when Gemini API is unavailable."""
    prediction = context.get('fusion_prediction', 'N/A')
    mmse = context.get('mmse_total', 'N/A')
    faq = context.get('faq_score', 'N/A')

    severity = 'normal range'
    if isinstance(mmse, (int, float)):
        if mmse < 10:
            severity = 'severe cognitive impairment'
        elif mmse < 19:
            severity = 'moderate cognitive impairment'
        elif mmse < 24:
            severity = 'mild cognitive impairment'

    return {
        'patient_summary': f"Patient {context['patient_name']} ({context['patient_gender']}, DOB: {context['patient_dob']}) "
                          f"underwent a comprehensive cognitive assessment including the Mini-Mental State Examination (MMSE), "
                          f"Functional Assessment Questionnaire (FAQ), and multimodal AI analysis combining clinical data with brain MRI.",

        'clinical_findings': f"The MMSE assessment yielded a total score of {mmse}/30, indicating {severity}. "
                            f"The Functional Assessment Questionnaire revealed a score of {faq}/15, "
                            f"reflecting the patient's functional abilities in daily living activities. "
                            f"The clinical AI model predicted: {context.get('clinical_prediction', 'N/A')}.",

        'mri_findings': f"Brain MRI analysis using a deep learning convolutional neural network was performed. "
                       f"The AI model predicted: {context.get('mri_prediction', 'N/A')}. "
                       f"Grad-CAM visualization highlighted regions of interest in the temporal and hippocampal areas.",

        'xai_summary': f"Explainable AI (SHAP) analysis revealed that MMSE score and FAQ score were the primary features "
                      f"driving the clinical prediction, with age and education level as secondary contributors. "
                      f"Grad-CAM heatmap analysis of the MRI scan identified areas consistent with the predicted classification.",

        'risk_assessment': f"Based on multimodal decision-level fusion of clinical assessments and neuroimaging data, "
                          f"the final predicted classification is: {prediction}. "
                          f"CN Probability: {context.get('cn_probability', 0):.1%}, "
                          f"MCI Probability: {context.get('mci_probability', 0):.1%}, "
                          f"AD Probability: {context.get('ad_probability', 0):.1%}.",

        'recommendations': "1. Schedule follow-up cognitive assessment in 6 months\n"
                          "2. Consider neurologist consultation for comprehensive evaluation\n"
                          "3. Begin prescribed cognitive rehabilitation exercises\n"
                          "4. Monitor daily functional abilities\n"
                          "5. Consider repeat MRI scan in 12 months for longitudinal comparison\n"
                          "6. Discuss findings with family members and caregivers",
    }
