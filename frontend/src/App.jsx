import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import MMSEAssessment from './pages/patient/MMSEAssessment';
import ClinicalAssessment from './pages/patient/ClinicalAssessment';
import ClinicalPrediction from './pages/patient/ClinicalPrediction';
import MRIUpload from './pages/patient/MRIUpload';
import FinalReport from './pages/patient/FinalReport';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';

// Exercise Page
import BrainExercise from './pages/exercises/BrainExercise';

// Protected Route wrapper
function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="brain-loader" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} /> : <LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Patient Routes */}
      <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/assessment" element={<ProtectedRoute role="patient"><MMSEAssessment /></ProtectedRoute>} />
      <Route path="/patient/clinical-assessment" element={<ProtectedRoute role="patient"><ClinicalAssessment /></ProtectedRoute>} />
      <Route path="/patient/clinical" element={<ProtectedRoute role="patient"><ClinicalPrediction /></ProtectedRoute>} />
      <Route path="/patient/mri" element={<ProtectedRoute role="patient"><MRIUpload /></ProtectedRoute>} />
      <Route path="/patient/report" element={<ProtectedRoute role="patient"><FinalReport /></ProtectedRoute>} />
      <Route path="/patient/exercise" element={<ProtectedRoute role="patient"><BrainExercise /></ProtectedRoute>} />

      {/* Doctor Routes */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/search" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />

      {/* Catch-all redirects to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1e293b',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
              padding: '14px 18px',
              fontSize: '0.9rem',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
