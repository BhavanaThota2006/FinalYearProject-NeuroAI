import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import { FiHeart, FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-right-panel">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-form-card"
      >
        <div className="auth-mobile-logo">
          <div className="auth-mobile-logo-icon">
            <FiHeart className="text-white text-xl" />
          </div>
          <h1 className="auth-mobile-logo-text">NeuroAI</h1>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-3xl text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-gray-500 mb-6">
                We've sent a password reset link to<br />
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <FiArrowLeft /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="auth-title">Forgot Password?</h2>
              <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

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

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center mt-6">
                <Link to="/login" className="text-primary-600 font-medium text-sm hover:text-primary-700 inline-flex items-center gap-1">
                  <FiArrowLeft /> Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
