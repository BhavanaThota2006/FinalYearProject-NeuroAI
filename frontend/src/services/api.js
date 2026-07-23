import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 (expired token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== Auth APIs ==========
export const registerPatient = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);

// ========== Assessment APIs ==========
export const evaluateAnswer = (data) => API.post('/assessment/evaluate', data);
export const submitMMSE = (data) => API.post('/assessment/mmse', data);
export const submitClinical = (data) => API.post('/assessment/clinical', data);
export const getAssessmentHistory = (patientId) => API.get(`/assessment/history/${patientId}`);

// ========== Prediction APIs ==========
export const getClinicalPrediction = (data) => API.post('/clinical/predict', data);
export const getMRIPrediction = (formData) =>
  API.post('/predict/mri', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getFusionPrediction = (data) => API.post('/predict/fusion', data);

// ========== Explainability APIs ==========
export const getSHAPExplanation = (data) => API.post('/explain/shap', data);
export const getGradCAM = (data) => API.post('/explain/gradcam', data);

// ========== Report APIs ==========
export const generateReport = (data) => API.post('/report/generate', data);
export const downloadReport = (reportId) =>
  API.get(`/report/download/${reportId}`, { responseType: 'blob' });

// ========== Exercise APIs ==========
export const submitExercise = (data) => API.post('/exercise/submit', data);
export const getExerciseHistory = (patientId) => API.get(`/exercise/history/${patientId}`);

// ========== Doctor APIs ==========
export const searchPatients = (query) => API.get(`/doctor/search?q=${query}`);
export const getAllPatients = (page = 1, perPage = 10, sortBy = 'created_at', sortOrder = 'desc') =>
  API.get(`/doctor/patients?page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`);
export const getDoctorStats = () => API.get('/doctor/stats');
export const getPatientDetail = (patientId) => API.get(`/doctor/patient/${patientId}`);

export default API;
