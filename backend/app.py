"""
AetherMind AI Backend — Flask Application
Explainable Multimodal Fusion for Early Alzheimer's Disease Prediction
"""

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config
import os

# Initialize extensions
from extensions import db


def create_app():
    """Application factory."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)

    # Ensure directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['REPORT_FOLDER'], exist_ok=True)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.assessment import assessment_bp
    from routes.prediction import prediction_bp, clinical_bp
    from routes.doctor import doctor_bp
    from routes.exercise import exercise_bp
    from routes.report import report_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessment')
    app.register_blueprint(prediction_bp, url_prefix='/api/predict')
    app.register_blueprint(clinical_bp, url_prefix='/api/clinical')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctor')
    app.register_blueprint(exercise_bp, url_prefix='/api/exercise')
    app.register_blueprint(report_bp, url_prefix='/api/report')

    # Register explainability routes
    from routes.explainability import explain_bp
    app.register_blueprint(explain_bp, url_prefix='/api/explain')

    # Create database tables
    with app.app_context():
        from models import db_models  # noqa
        db.create_all()
        
        # Seed default doctor
        from models.db_models import Doctor
        from werkzeug.security import generate_password_hash
        doc = Doctor.query.filter_by(email='doctor@neuroai.com').first()
        if not doc:
            doc = Doctor(
                name='Dr. Neurologist',
                email='doctor@neuroai.com',
                password_hash=generate_password_hash('doctor123'),
                specialization='Neurology'
            )
            db.session.add(doc)
            db.session.commit()
        elif doc.password_hash == 'scrypt:32768:8:1$salt$hash_placeholder':
            doc.password_hash = generate_password_hash('doctor123')
            db.session.commit()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
