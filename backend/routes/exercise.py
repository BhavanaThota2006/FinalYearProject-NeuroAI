"""
Exercise Routes — Submit and retrieve exercise results
"""

from flask import Blueprint, request, jsonify
from services.auth_middleware import token_required

exercise_bp = Blueprint('exercise', __name__)


@exercise_bp.route('/submit', methods=['POST'])
@token_required
def submit_exercise(current_user):
    """Submit exercise result."""
    from extensions import db
    from models.db_models import ExerciseResult

    data = request.get_json()

    exercise = ExerciseResult(
        patient_id=current_user['user_id'],
        exercise_type=data.get('exercise_type', 'Unknown'),
        score=data.get('score', 0),
    )
    db.session.add(exercise)
    db.session.commit()

    return jsonify({
        'message': 'Exercise result saved',
        'exercise_id': exercise.id,
    }), 201


@exercise_bp.route('/history/<int:patient_id>', methods=['GET'])
@token_required
def get_exercise_history(current_user, patient_id):
    """Get exercise history for a patient."""
    from models.db_models import ExerciseResult

    exercises = ExerciseResult.query.filter_by(patient_id=patient_id)\
        .order_by(ExerciseResult.completion_date.desc()).limit(10).all()

    if not exercises:
        return jsonify({}), 200

    latest = exercises[0]
    return jsonify({
        'type': latest.exercise_type,
        'score': latest.score,
        'date': latest.completion_date.isoformat(),
        'history': [{
            'type': e.exercise_type,
            'score': e.score,
            'date': e.completion_date.isoformat(),
        } for e in exercises],
    }), 200
