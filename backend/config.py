import os
from dotenv import load_dotenv

# Load environmental variables from .env
load_dotenv()

class Config:
    """Flask application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'neuroai-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours

    # MySQL / SQLite Database Configuration
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'neuroai_db')
    
    DB_TYPE = os.environ.get('DB_TYPE', 'auto').lower()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sqlite_path = os.path.join(base_dir, 'neuroai.db')
    sqlite_uri = f"sqlite:///{sqlite_path}"
    
    if DB_TYPE == 'sqlite':
        SQLALCHEMY_DATABASE_URI = sqlite_uri
    else:
        import urllib.parse, socket
        _pwd = urllib.parse.quote_plus(MYSQL_PASSWORD)
        mysql_uri = f"mysql+pymysql://{MYSQL_USER}:{_pwd}@{MYSQL_HOST}/{MYSQL_DB}"
        
        can_connect = False
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.5)
            err = s.connect_ex((MYSQL_HOST, 3306))
            s.close()
            if err == 0:
                can_connect = True
        except Exception:
            can_connect = False
            
        if can_connect:
            SQLALCHEMY_DATABASE_URI = mysql_uri
        else:
            SQLALCHEMY_DATABASE_URI = sqlite_uri

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
