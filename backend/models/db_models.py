"""
Database Models — SQLAlchemy ORM
Tables: patients, doctors, cognitive_assessments, clinical_assessments,
        mri_results, fusion_results, exercise_results
"""

from extensions import db
from datetime import datetime


class Patient(db.Model):
    """Patient user model."""
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(20))
    dob = db.Column(db.Date)
    gender = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    cognitive_assessments = db.relationship('CognitiveAssessment', backref='patient', lazy=True)
    clinical_assessments = db.relationship('ClinicalAssessment', backref='patient', lazy=True)
    mri_results = db.relationship('MRIResult', backref='patient', lazy=True)
    fusion_results = db.relationship('FusionResult', backref='patient', lazy=True)
    exercise_results = db.relationship('ExerciseResult', backref='patient', lazy=True)


class Doctor(db.Model):
    """Doctor user model."""
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    specialization = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class CognitiveAssessment(db.Model):
    """MMSE cognitive assessment results."""
    __tablename__ = 'cognitive_assessments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    orientation_score = db.Column(db.Integer, default=0)
    registration_score = db.Column(db.Integer, default=0)
    attention_score = db.Column(db.Integer, default=0)
    recall_score = db.Column(db.Integer, default=0)
    language_score = db.Column(db.Integer, default=0)
    visuospatial_score = db.Column(db.Integer, default=0)
    mmse_total = db.Column(db.Integer, default=0)
    assessment_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    responses = db.relationship('CognitiveResponse', backref='assessment', lazy=True)


class ClinicalAssessment(db.Model):
    """Clinical assessment with demographics and FAQ."""
    __tablename__ = 'clinical_assessments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    education = db.Column(db.Integer)  # years of education
    faq_score = db.Column(db.Integer, default=0)
    mmse_score = db.Column(db.Integer, default=0)
    prediction = db.Column(db.String(10))
    cn_probability = db.Column(db.Float, default=0.0)
    mci_probability = db.Column(db.Float, default=0.0)
    ad_probability = db.Column(db.Float, default=0.0)
    assessment_date = db.Column(db.DateTime, default=datetime.utcnow)


class MRIResult(db.Model):
    """MRI prediction results."""
    __tablename__ = 'mri_results'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    image_path = db.Column(db.String(500))
    cn_probability = db.Column(db.Float, default=0.0)
    mci_probability = db.Column(db.Float, default=0.0)
    ad_probability = db.Column(db.Float, default=0.0)
    prediction = db.Column(db.String(10))
    gradcam_path = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class FusionResult(db.Model):
    """Decision-level fusion results."""
    __tablename__ = 'fusion_results'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    clinical_id = db.Column(db.Integer, db.ForeignKey('clinical_assessments.id'))
    mri_id = db.Column(db.Integer, db.ForeignKey('mri_results.id'))
    cn_probability = db.Column(db.Float, default=0.0)
    mci_probability = db.Column(db.Float, default=0.0)
    ad_probability = db.Column(db.Float, default=0.0)
    final_prediction = db.Column(db.String(10))
    report_text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ExerciseResult(db.Model):
    """Cognitive rehabilitation exercise results."""
    __tablename__ = 'exercise_results'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    exercise_type = db.Column(db.String(100))
    score = db.Column(db.Integer, default=0)
    completion_date = db.Column(db.DateTime, default=datetime.utcnow)


class CognitiveResponse(db.Model):
    """Detailed responses for each MMSE question."""
    __tablename__ = 'cognitive_responses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('cognitive_assessments.id'), nullable=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    question_id = db.Column(db.String(100), nullable=False)
    question_text = db.Column(db.String(500), nullable=False)
    patient_response = db.Column(db.Text, nullable=True)
    expected_answer = db.Column(db.String(500), nullable=True)
    score = db.Column(db.Integer, default=0)
    section = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

