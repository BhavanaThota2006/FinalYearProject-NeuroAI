"""
Authentication Routes — Register, Login, Forgot Password
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from config import Config

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new patient."""
    from extensions import db
    from models.db_models import Patient

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone', '')
    dob = data.get('dob')
    gender = data.get('gender', 'Male')

    if not all([name, email, password]):
        return jsonify({'message': 'Name, email, and password are required'}), 400

    # Check if email exists
    existing = Patient.query.filter_by(email=email).first()
    if existing:
        return jsonify({'message': 'Email already registered'}), 409

    # Create patient
    patient = Patient(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        phone=phone,
        dob=datetime.datetime.strptime(dob, '%Y-%m-%d').date() if dob else None,
        gender=gender,
    )
    db.session.add(patient)
    db.session.commit()

    return jsonify({'message': 'Registration successful', 'patient_id': patient.id}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login for patient or doctor."""
    from models.db_models import Patient, Doctor

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'patient')

    if not all([email, password]):
        return jsonify({'message': 'Email and password are required'}), 400

    user = None
    if role == 'doctor':
        user = Doctor.query.filter_by(email=email).first()
    else:
        user = Patient.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid email or password'}), 401

    # Generate JWT token
    token = jwt.encode(
        {
            'user_id': user.id,
            'role': role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES),
        },
        Config.JWT_SECRET_KEY,
        algorithm='HS256',
    )

    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': role,
        },
    }), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Handle forgot password request."""
    from models.db_models import Patient

    data = request.get_json()
    email = data.get('email')

    patient = Patient.query.filter_by(email=email).first()
    if not patient:
        return jsonify({'message': 'Email not found'}), 404

    # In production, send email with reset link
    # For now, just confirm the email exists
    return jsonify({'message': 'Password reset link sent to your email'}), 200
