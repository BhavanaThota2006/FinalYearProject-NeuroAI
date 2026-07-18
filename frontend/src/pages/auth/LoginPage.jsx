import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/api';
import { FiHeart, FiMail, FiLock, FiUser, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password, role: activeTab });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(activeTab === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel - Branding */}
      <div className="auth-left-panel">
        {/* Decorative circles */}
        <div className="auth-left-decor-circle-1" />
        <div className="auth-left-decor-circle-2" />
        <div className="auth-left-decor-circle-3" />

        <div className="auth-left-header">
          <div className="auth-left-brand-wrapper">
            <div className="auth-left-brand-logo">
              <FiHeart className="text-white text-2xl" />
            </div>
            <h1 className="auth-left-brand-title">NeuroAI</h1>
          </div>
          <p className="auth-left-subtitle">Alzheimer's Detection Platform</p>
        </div>

        <div className="auth-left-body">
          <h2 className="auth-left-main-title">
            Early Detection,<br />Better Outcomes.
          </h2>
          <p className="auth-left-description">
            Explainable Multimodal Fusion combining Brain MRI analysis with clinical assessments for accurate Alzheimer's Disease prediction.
          </p>
          <div className="auth-stat-group">
            <div className="auth-stat">
              <p className="auth-stat-value">98.2%</p>
              <p className="auth-stat-label">Accuracy Rate</p>
            </div>
            <div className="auth-stat">
              <p className="auth-stat-value">50K+</p>
              <p className="auth-stat-label">MRI Scans Analyzed</p>
            </div>
            <div className="auth-stat">
              <p className="auth-stat-value">AI</p>
              <p className="auth-stat-label">Explainable Results</p>
            </div>
          </div>
        </div>

        <p className="auth-left-footer">
          © 2026 NeuroAI Platform — B.Tech Final Year Project
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-right-panel">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="auth-form-card"
        >
          {/* Mobile logo */}
          <div className="auth-mobile-logo">
            <div className="auth-mobile-logo-icon">
              <FiHeart className="text-white text-xl" />
            </div>
            <h1 className="auth-mobile-logo-text">NeuroAI</h1>
          </div>

          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue to your dashboard</p>

          {/* Role Tabs */}
          <div className="auth-tabs">
            <button
              onClick={() => setActiveTab('patient')}
              className={`auth-tab-btn ${activeTab === 'patient' ? 'active' : ''}`}
            >
              <FiUser className="text-lg" /> Patient
            </button>
            <button
              onClick={() => setActiveTab('doctor')}
              className={`auth-tab-btn ${activeTab === 'doctor' ? 'active' : ''}`}
            >
              <FiShield className="text-lg" /> Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group-wrapper">
              <label className="form-label">Email Address</label>
              <div className="form-input-container">
                <FiMail className="form-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-11"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group-wrapper">
              <label className="form-label">Password</label>
              <div className="form-input-container">
                <FiLock className="form-input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-11"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="auth-helper-link-wrapper">
              <Link to="/forgot-password" className="auth-helper-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {activeTab === 'patient' && (
            <p className="auth-footer-prompt">
              Don't have an account?{' '}
              <Link to="/register" className="auth-footer-link">
                Register Now
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
