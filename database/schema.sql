-- NeuroAI Database Schema
-- MySQL Database: neuroai_db

CREATE DATABASE IF NOT EXISTS neuroai_db;
USE neuroai_db;

-- ========== PATIENTS TABLE ==========
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    phone VARCHAR(20),
    dob DATE,
    gender VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== DOCTORS TABLE ==========
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    specialization VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== COGNITIVE ASSESSMENTS (MMSE) ==========
CREATE TABLE IF NOT EXISTS cognitive_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    orientation_score INT DEFAULT 0,
    registration_score INT DEFAULT 0,
    attention_score INT DEFAULT 0,
    recall_score INT DEFAULT 0,
    language_score INT DEFAULT 0,
    visuospatial_score INT DEFAULT 0,
    mmse_total INT DEFAULT 0,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ========== CLINICAL ASSESSMENTS ==========
CREATE TABLE IF NOT EXISTS clinical_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    age INT,
    gender VARCHAR(10),
    education INT,
    faq_score INT DEFAULT 0,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ========== MRI RESULTS ==========
CREATE TABLE IF NOT EXISTS mri_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    image_path VARCHAR(500),
    cn_probability FLOAT DEFAULT 0.0,
    mci_probability FLOAT DEFAULT 0.0,
    ad_probability FLOAT DEFAULT 0.0,
    prediction VARCHAR(10),
    gradcam_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ========== FUSION RESULTS ==========
CREATE TABLE IF NOT EXISTS fusion_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinical_id INT,
    mri_id INT,
    cn_probability FLOAT DEFAULT 0.0,
    mci_probability FLOAT DEFAULT 0.0,
    ad_probability FLOAT DEFAULT 0.0,
    final_prediction VARCHAR(10),
    report_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (clinical_id) REFERENCES clinical_assessments(id),
    FOREIGN KEY (mri_id) REFERENCES mri_results(id)
);

-- ========== EXERCISE RESULTS ==========
CREATE TABLE IF NOT EXISTS exercise_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    exercise_type VARCHAR(100),
    score INT DEFAULT 0,
    completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ========== INSERT DEFAULT DOCTOR ==========
-- Password: doctor123 (hashed with werkzeug)
INSERT INTO doctors (name, email, password_hash, specialization)
VALUES ('Dr. Neurologist', 'doctor@neuroai.com',
        'scrypt:32768:8:1$salt$hash_placeholder',
        'Neurology')
ON DUPLICATE KEY UPDATE name = name;
