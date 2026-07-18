import os
from dotenv import load_dotenv

# Load environmental variables from .env
load_dotenv()

class Config:
    """Flask application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'neuroai-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours

    # MySQL Database
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'neuroai_db')
    
    import urllib.parse
    _pwd = urllib.parse.quote_plus(MYSQL_PASSWORD)
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{_pwd}@{MYSQL_HOST}/{MYSQL_DB}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File Upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    REPORT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reports')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB

    # Model Paths
    MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
    CLINICAL_MODEL_PATH = os.path.join(MODEL_DIR, 'clinical_model.pkl')
    MRI_MODEL_PATH = os.path.join(MODEL_DIR, 'mri_model.pth')
    FUSION_MODEL_PATH = os.path.join(MODEL_DIR, 'fusion_model.pkl')

    # Clinical XGBoost Model Paths
    ML_MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ml_models')
    CLINICAL_MODEL_PKL = os.path.join(ML_MODEL_DIR, 'clinical_model.pkl')
    LABEL_ENCODER_PKL = os.path.join(ML_MODEL_DIR, 'label_encoder.pkl')
    FEATURE_COLUMNS_PKL = os.path.join(ML_MODEL_DIR, 'feature_columns.pkl')

    # Gemini API Key
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
