import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerPatient } from '../../services/api';
import { FiHeart, FiUser, FiMail, FiLock, FiPhone, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', dob: '', gender: 'Male',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await registerPatient({
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, dob: form.dob, gender: form.gender,
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Branding Panel */}
      <div className="auth-left-panel">
        <div className="auth-left-decor-circle-1" />
        <div className="auth-left-decor-circle-2" />
        <div className="auth-left-header">
          <div className="auth-left-brand-wrapper">
            <div className="auth-left-brand-logo">
              <FiHeart className="text-white text-2xl" />
            </div>
            <h1 className="auth-left-brand-title">NeuroAI</h1>
          </div>
        </div>
        <div className="auth-left-body">
          <h2 className="auth-left-main-title">
            Start Your<br />Assessment Today
          </h2>
          <p className="auth-left-description">
            Register to get access to AI-powered cognitive assessments and early Alzheimer's detection.
          </p>
        </div>
        <p className="auth-left-footer">© 2026 NeuroAI Platform</p>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right-panel">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-form-card wide"
        >
          <div className="auth-mobile-logo">
            <div className="auth-mobile-logo-icon">
              <FiHeart className="text-white text-xl" />
            </div>
            <h1 className="auth-mobile-logo-text">NeuroAI</h1>
          </div>

          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register as a patient to begin your assessment</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-grid-2">
              <div className="form-group-wrapper">
                <label className="form-label">Full Name</label>
                <div className="form-input-container">
                  <FiUser className="form-input-icon" />
                  <input name="name" value={form.name} onChange={handleChange} type="text" required className="form-input pl-11" placeholder="John Doe" />
                </div>
              </div>
              <div className="form-group-wrapper">
                <label className="form-label">Phone</label>
                <div className="form-input-container">
                  <FiPhone className="form-input-icon" />
                  <input name="phone" value={form.phone} onChange={handleChange} type="tel" required className="form-input pl-11" placeholder="+91 9876543210" />
                </div>
              </div>
            </div>

            <div className="form-group-wrapper">
              <label className="form-label">Email Address</label>
              <div className="form-input-container">
                <FiMail className="form-input-icon" />
                <input name="email" value={form.email} onChange={handleChange} type="email" required className="form-input pl-11" placeholder="john@example.com" />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group-wrapper">
                <label className="form-label">Date of Birth</label>
                <div className="form-input-container">
                  <FiCalendar className="form-input-icon" />
                  <input name="dob" value={form.dob} onChange={handleChange} type="date" required className="form-input pl-11" />
                </div>
              </div>
              <div className="form-group-wrapper">
                <label className="form-label">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="form-input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group-wrapper">
                <label className="form-label">Password</label>
                <div className="form-input-container">
                  <FiLock className="form-input-icon" />
                  <input name="password" value={form.password} onChange={handleChange} type="password" required className="form-input pl-11" placeholder="••••••••" />
                </div>
              </div>
              <div className="form-group-wrapper">
                <label className="form-label">Confirm Password</label>
                <div className="form-input-container">
                  <FiLock className="form-input-icon" />
                  <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" required className="form-input pl-11" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-prompt">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
