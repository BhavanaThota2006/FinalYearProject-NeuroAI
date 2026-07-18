"""
Assessment Routes — MMSE and Clinical Assessment submission and history
"""

from flask import Blueprint, request, jsonify
from services.auth_middleware import token_required
from datetime import datetime

assessment_bp = Blueprint('assessment', __name__)


@assessment_bp.route('/evaluate', methods=['POST'])
@token_required
def evaluate_answer(current_user):
    """Evaluate one MMSE question response automatically."""
    data = request.get_json() or {}
    question_id = data.get('question_id')
    recognized_text = data.get('recognized_text', '').strip()
    lang = data.get('lang', 'en-US')

    score = 0
    feedback = "Thank you."
    expected_answer = ""

    def normalize(text):
        if not text:
            return ""
        text = text.lower()
        for char in ".,?!-\";:()[]{}":
            text = text.replace(char, " ")
        return " ".join(text.split())

    norm_text = normalize(recognized_text)

    # Orientation - Time Questions
    if question_id == 'year':
        curr_year = datetime.now().year
        expected_answer = str(curr_year)
        if expected_answer in norm_text or "twenty twenty six" in norm_text or "two thousand twenty six" in norm_text:
            score = 1
        elif "2026" in norm_text or "రెండు వేల ఇరవై ఆరు" in norm_text or "दो हज़ार छब्बीस" in norm_text:
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["2026", "ఇరవై ఆరు", "రెండు వేల"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["2026", "छब्बीस", "दो हजार"]):
            score = 1

    elif question_id == 'month':
        months_en = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
        curr_month_idx = datetime.now().month - 1
        curr_month_en = months_en[curr_month_idx]
        expected_answer = curr_month_en.capitalize()
        if curr_month_en in norm_text or str(curr_month_idx + 1) in norm_text:
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["జూలై", "జులై", "7"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["जुलाई", "7"]):
            score = 1

    elif question_id == 'date':
        curr_date = datetime.now().day
        expected_answer = str(curr_date)
        if expected_answer in norm_text or (str(curr_date) + "th") in norm_text:
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["18", "పద్దెనిమిది", "పద్ధెనిమిది"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["18", "अठारह"]):
            score = 1

    elif question_id == 'day':
        days_en = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        curr_day_idx = datetime.now().weekday()
        curr_day_en = days_en[curr_day_idx]
        expected_answer = curr_day_en.capitalize()
        if curr_day_en in norm_text:
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["శనివారం", "శని"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["शनिवार"]):
            score = 1

    elif question_id == 'season':
        expected_answer = "Monsoon/Rainy (or Winter/Summer)"
        seasons = ["monsoon", "rainy", "summer", "winter", "spring", "autumn", "fall"]
        if any(s in norm_text for s in seasons):
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["వర్షాకాలం", "వర్ష", "ఎండాకాలం", "చలికాలం"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["वर्षा", "मानसून", "गर्मी", "सर्दी", "बरसात"]):
            score = 1

    # Orientation - Place Questions
    elif question_id == 'country':
        expected_answer = "India"
        if "india" in norm_text:
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["భారతదేశం", "భారత్", "ఇండియా"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["भारत", "इण्डिया", "इंडिया"]):
            score = 1

    elif question_id == 'state':
        expected_answer = "Telangana (or Andhra Pradesh)"
        if any(s in norm_text for s in ["telangana", "andhra", "pradesh"]):
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["తెలంగాణ", "ఆంధ్రప్రదేశ్", "ఆంధ్ర"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["तेलंगाना", "आंध्र प्रदेश"]):
            score = 1

    elif question_id == 'city':
        expected_answer = "Hyderabad"
        if "hyderabad" in norm_text:
            score = 1
        elif lang.startswith('te') and "హైదరాబాద్" in recognized_text:
            score = 1
        elif lang.startswith('hi') and "हैदराबाद" in recognized_text:
            score = 1

    elif question_id == 'hospital':
        expected_answer = "NeuroAI Hospital/Apollo/Care"
        if any(w in norm_text for w in ["neuro", "hospital", "clinic", "apollo", "care"]):
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["న్యూరో", "హాస్పిటల్", "ఆసుపత్రి", "క్లినిక్"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["न्यूरो", "अस्पताल", "हॉस्पिटल", "क्लीनिक"]):
            score = 1

    elif question_id == 'floor':
        expected_answer = "First/Ground/1"
        if any(w in norm_text for w in ["first", "ground", "second", "third", "1", "2", "3", "one", "two", "three", "floor"]):
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["మొదటి", "ఒకటో", "1", "ఒకటవ", "అంతస్తు"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["पहली", "पहला", "1", "ग्राउंड", "एक", "मंजिल"]):
            score = 1

    # Registration (Apple, Table, Penny)
    elif question_id == 'registration':
        expected_answer = "Apple, Table, Penny"
        matches = 0
        if lang.startswith('te'):
            if any(w in recognized_text for w in ["యాపిల్", "ఆపిల్", "apple"]):
                matches += 1
            if any(w in recognized_text for w in ["టేబుల్", "table"]):
                matches += 1
            if any(w in recognized_text for w in ["పెన్నీ", "penny"]):
                matches += 1
        elif lang.startswith('hi'):
            if any(w in recognized_text for w in ["सेब", "एप्पल", "apple"]):
                matches += 1
            if any(w in recognized_text for w in ["मेज", "टेबल", "table"]):
                matches += 1
            if any(w in recognized_text for w in ["पैसा", "पेनी", "penny"]):
                matches += 1
        else:
            if "apple" in norm_text:
                matches += 1
            if "table" in norm_text:
                matches += 1
            if "penny" in norm_text:
                matches += 1
        score = matches

    # Attention & Calculation: Spelling WORLD backwards or subtracting 7
    elif question_id == 'attention':
        expected_answer = "D-L-R-O-W or 93, 86, 79, 72, 65"
        sub_steps = ["93", "86", "79", "72", "65"]
        matches = 0
        for step in sub_steps:
            if step in norm_text:
                matches += 1
        if matches > 0:
            score = min(matches, 5)
        else:
            chars = [c for c in norm_text if c in 'dlrow']
            target = "dlrow"
            t_idx = 0
            for char in chars:
                if t_idx < len(target) and char == target[t_idx]:
                    t_idx += 1
            score = t_idx

    # Recall
    elif question_id == 'recall':
        expected_answer = "Apple, Table, Penny"
        matches = 0
        if lang.startswith('te'):
            if any(w in recognized_text for w in ["యాపిల్", "ఆపిల్", "apple"]):
                matches += 1
            if any(w in recognized_text for w in ["టేబుల్", "table"]):
                matches += 1
            if any(w in recognized_text for w in ["పెన్నీ", "penny"]):
                matches += 1
        elif lang.startswith('hi'):
            if any(w in recognized_text for w in ["सेब", "एप्पल", "apple"]):
                matches += 1
            if any(w in recognized_text for w in ["मेज", "टेबल", "table"]):
                matches += 1
            if any(w in recognized_text for w in ["पैसा", "पेनी", "penny"]):
                matches += 1
        else:
            if "apple" in norm_text:
                matches += 1
            if "table" in norm_text:
                matches += 1
            if "penny" in norm_text:
                matches += 1
        score = matches

    # Language Tasks
    elif question_id == 'naming1':
        expected_answer = "Pencil"
        if "pencil" in norm_text:
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["పెన్సిల్", "కలం"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["पencil", "पेंसिल", "कलम"]):
            score = 1

    elif question_id == 'naming2':
        expected_answer = "Watch"
        if any(w in norm_text for w in ["watch", "clock"]):
            score = 1
        elif lang.startswith('te') and any(w in recognized_text for w in ["వాచ్", "గడియారం"]):
            score = 1
        elif lang.startswith('hi') and any(w in recognized_text for w in ["घड़ी", "वॉच"]):
            score = 1

    elif question_id == 'repeat':
        if lang.startswith('te'):
            expected_answer = "పట్టువదలని విక్రమార్కుడు"
            if any(w in recognized_text for w in ["విక్రమార్కుడు", "పట్టువదలని", "విక్రమా"]):
                score = 1
        elif lang.startswith('hi'):
            expected_answer = "किन्तु परन्तु कुछ भी नहीं"
            if any(w in recognized_text for w in ["किन्तु", "परन्तु", "कुछ", "नहीं"]):
                score = 1
        else:
            expected_answer = "No ifs, ands, or buts"
            if any(w in norm_text for w in ["ifs", "ands", "buts"]):
                score = 1

    elif question_id == 'command':
        expected_answer = "I have folded the paper and placed it on the table"
        if lang.startswith('te'):
            if any(w in recognized_text for w in ["మడిచాను", "టేబుల్", "పేపర్", "హా", "సరే", "done", "yes"]):
                score = 3
        elif lang.startswith('hi'):
            if any(w in recognized_text for w in ["मोड़", "कागज", "मेज", "कर दिया", "हाँ", "done", "yes"]):
                score = 3
        else:
            words = ["fold", "paper", "table", "done", "yes", "did", "put"]
            checked = sum(1 for w in words if w in norm_text)
            if checked >= 2:
                score = 3
            elif checked == 1:
                score = 1

    elif question_id == 'reading':
        expected_answer = "I have closed my eyes"
        if lang.startswith('te'):
            if any(w in recognized_text for w in ["కళ్ళు", "మూసుకు", "done", "yes"]):
                score = 1
        elif lang.startswith('hi'):
            if any(w in recognized_text for w in ["आँखें", "बंद", "done", "yes"]):
                score = 1
        else:
            if any(w in norm_text for w in ["close", "eye", "done", "yes"]):
                score = 1

    elif question_id == 'writing':
        expected_answer = "A spoken sentence"
        words_count = len(recognized_text.split())
        if words_count >= 3:
            score = 1

    acknowledgments = {
        'en-US': ["Thank you.", "Good.", "Let's continue.", "Okay."],
        'te-IN': ["ధన్యవాదాలు.", "మంచిది.", "కొనసాగిద్దాం.", "సరే."],
        'hi-IN': ["धन्यवाद।", "अच्छा।", "आगे बढ़ते हैं।", "ठीक है।"]
    }
    ack_list = acknowledgments.get(lang, acknowledgments['en-US'])
    feedback = ack_list[len(recognized_text) % len(ack_list)]

    return jsonify({
        'score': score,
        'feedback': feedback,
        'expected_answer': expected_answer
    }), 200


@assessment_bp.route('/mmse', methods=['POST'])
@token_required
def submit_mmse(current_user):
    """Submit MMSE cognitive assessment results."""
    from extensions import db
    from models.db_models import CognitiveAssessment, CognitiveResponse

    data = request.get_json()

    assessment = CognitiveAssessment(
        patient_id=current_user['user_id'],
        orientation_score=data.get('orientation', 0),
        registration_score=data.get('registration', 0),
        attention_score=data.get('attention', 0),
        recall_score=data.get('recall', 0),
        language_score=data.get('language', 0),
        visuospatial_score=data.get('visuospatial', 0),
        mmse_total=data.get('mmse_total', 0),
    )
    db.session.add(assessment)
    db.session.commit()

    # Save detailed responses if available
    responses = data.get('responses', [])
    for resp in responses:
        cog_resp = CognitiveResponse(
            assessment_id=assessment.id,
            patient_id=current_user['user_id'],
            question_id=resp.get('question_id'),
            question_text=resp.get('question_text'),
            patient_response=resp.get('patient_response'),
            expected_answer=resp.get('expected_answer'),
            score=resp.get('score', 0),
            section=resp.get('section')
        )
        db.session.add(cog_resp)
    db.session.commit()

    return jsonify({
        'message': 'MMSE assessment saved',
        'assessment_id': assessment.id,
        'mmse_total': assessment.mmse_total,
    }), 201


@assessment_bp.route('/clinical', methods=['POST'])
@token_required
def submit_clinical(current_user):
    """Submit clinical assessment (demographics + FAQ)."""
    from extensions import db
    from models.db_models import ClinicalAssessment

    data = request.get_json()

    assessment = ClinicalAssessment(
        patient_id=current_user['user_id'],
        age=data.get('age'),
        gender=data.get('gender'),
        education=data.get('education'),
        faq_score=data.get('faq_score', 0),
    )
    db.session.add(assessment)
    db.session.commit()

    return jsonify({
        'message': 'Clinical assessment saved',
        'assessment_id': assessment.id,
    }), 201


@assessment_bp.route('/history/<int:patient_id>', methods=['GET'])
@token_required
def get_history(current_user, patient_id):
    """Get assessment history for a patient."""
    from models.db_models import CognitiveAssessment, ClinicalAssessment, MRIResult, FusionResult

    # Get latest MMSE
    mmse = CognitiveAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(CognitiveAssessment.assessment_date.desc()).first()

    # Get latest clinical
    clinical = ClinicalAssessment.query.filter_by(patient_id=patient_id)\
        .order_by(ClinicalAssessment.assessment_date.desc()).first()

    # Get latest MRI
    mri = MRIResult.query.filter_by(patient_id=patient_id)\
        .order_by(MRIResult.created_at.desc()).first()

    # Get latest fusion
    fusion = FusionResult.query.filter_by(patient_id=patient_id)\
        .order_by(FusionResult.created_at.desc()).first()

    result = {}
    if mmse:
        result['mmse'] = {
            'score': mmse.mmse_total,
            'orientation': mmse.orientation_score,
            'registration': mmse.registration_score,
            'attention': mmse.attention_score,
            'recall': mmse.recall_score,
            'language': mmse.language_score,
            'visuospatial': mmse.visuospatial_score,
            'date': mmse.assessment_date.isoformat(),
        }
    if clinical:
        result['clinical'] = {
            'age': clinical.age,
            'gender': clinical.gender,
            'education': clinical.education,
            'faq_score': clinical.faq_score,
            'date': clinical.assessment_date.isoformat(),
        }
    if mri:
        result['mri'] = {
            'cn_prob': mri.cn_probability,
            'mci_prob': mri.mci_probability,
            'ad_prob': mri.ad_probability,
            'prediction': mri.prediction,
            'date': mri.created_at.isoformat(),
        }
    if fusion:
        result['fusion'] = {
            'cn_prob': fusion.cn_probability,
            'mci_prob': fusion.mci_probability,
            'ad_prob': fusion.ad_probability,
            'prediction': fusion.final_prediction,
            'date': fusion.created_at.isoformat(),
        }

    return jsonify(result), 200
