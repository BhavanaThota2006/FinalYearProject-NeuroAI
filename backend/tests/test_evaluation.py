import unittest
import sys
import os
import json
import jwt
from datetime import datetime

# Adjust Python path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from config import Config

class TestEvaluation(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Create user token
        self.token = jwt.encode(
            {'user_id': 1, 'role': 'patient'}, 
            Config.JWT_SECRET_KEY, 
            algorithm='HS256'
        )
        self.headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }

        # Seed test patient user (requires patients table)
        from extensions import db
        from models.db_models import Patient
        p = Patient.query.get(1)
        if not p:
            from werkzeug.security import generate_password_hash
            p = Patient(
                id=1,
                name="Test Patient",
                email="patient@test.com",
                password_hash=generate_password_hash("password123")
            )
            db.session.add(p)
            db.session.commit()

    def tearDown(self):
        self.app_context.pop()

    def test_evaluate_year(self):
        # English: Current year
        curr_year = str(datetime.now().year)
        response = self.client.post('/api/assessment/evaluate', headers=self.headers, data=json.dumps({
            'question_id': 'year',
            'recognized_text': f'the year is {curr_year}',
            'lang': 'en-US'
        }))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['score'], 1)

        # Telugu: Current year
        response = self.client.post('/api/assessment/evaluate', headers=self.headers, data=json.dumps({
            'question_id': 'year',
            'recognized_text': 'ప్రస్తుతం 2026 సంవత్సరం',
            'lang': 'te-IN'
        }))
        data = json.loads(response.data)
        self.assertEqual(data['score'], 1)

    def test_evaluate_registration(self):
        # English correct
        response = self.client.post('/api/assessment/evaluate', headers=self.headers, data=json.dumps({
            'question_id': 'registration',
            'recognized_text': 'apple, table, and penny please',
            'lang': 'en-US'
        }))
        data = json.loads(response.data)
        self.assertEqual(data['score'], 3)

        # English partial
        response = self.client.post('/api/assessment/evaluate', headers=self.headers, data=json.dumps({
            'question_id': 'registration',
            'recognized_text': 'apple and table',
            'lang': 'en-US'
        }))
        data = json.loads(response.data)
        self.assertEqual(data['score'], 2)

    def test_evaluate_attention(self):
        # WORLD spelling backwards
        response = self.client.post('/api/assessment/evaluate', headers=self.headers, data=json.dumps({
            'question_id': 'attention',
            'recognized_text': 'd-l-r-o-w',
            'lang': 'en-US'
        }))
        data = json.loads(response.data)
        self.assertEqual(data['score'], 5)

        # Serial sevens subtraction
        response = self.client.post('/api/assessment/evaluate', headers=self.headers, data=json.dumps({
            'question_id': 'attention',
            'recognized_text': '93, 86, 79, 72, 65',
            'lang': 'en-US'
        }))
        data = json.loads(response.data)
        self.assertEqual(data['score'], 5)

    def test_evaluate_naming(self):
        # Pencil
        response = self.client.post('/api/assessment/evaluate', headers=self.headers, data=json.dumps({
            'question_id': 'naming1',
            'recognized_text': 'that is a pencil',
            'lang': 'en-US'
        }))
        data = json.loads(response.data)
        self.assertEqual(data['score'], 1)

        # Pencil incorrect
        response = self.client.post('/api/assessment/evaluate', headers=self.headers, data=json.dumps({
            'question_id': 'naming1',
            'recognized_text': 'it is an apple',
            'lang': 'en-US'
        }))
        data = json.loads(response.data)
        self.assertEqual(data['score'], 0)

    def test_submit_mmse(self):
        payload = {
            'orientation': 10,
            'registration': 3,
            'attention': 5,
            'recall': 3,
            'language': 8,
            'visuospatial': 1,
            'mmse_total': 30,
            'responses': [
                {
                    'question_id': 'year',
                    'question_text': 'What is the current year?',
                    'patient_response': '2026',
                    'expected_answer': '2026',
                    'score': 1,
                    'section': 'orientation'
                }
            ]
        }
        response = self.client.post('/api/assessment/mmse', headers=self.headers, data=json.dumps(payload))
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('assessment_id', data)
        self.assertEqual(data['mmse_total'], 30)


if __name__ == '__main__':
    unittest.main()
