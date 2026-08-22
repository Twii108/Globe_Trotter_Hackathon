import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Compass, ArrowRight } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { authService } from '../services/api';
import '../styles/auth.css';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      }
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    setForgotSuccess(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-hero-section">
        <div className="auth-hero-brand">
          <div className="navbar-brand-icon">
            <Compass size={22} />
          </div>
          <span>GlobeTrotter</span>
        </div>

        <div className="auth-hero-content">
          <h1 className="auth-hero-title">Your Next Journey Begins Here</h1>
          <p className="auth-hero-subtitle">
            Plan, organize, and experience personalized travel itineraries tailored to your unique passions and budget.
          </p>
        </div>

        <div className="auth-hero-footer">
          © 2026 GlobeTrotter Inc. Smart Travel Assistant.
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to access your saved trips and personalized plans</p>
          </div>

          {apiError && (
            <div className="auth-alert auth-alert-error">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex@example.com"
              icon={<Mail size={18} />}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.password}
              required
            />

            <div className="auth-form-meta">
              <span />
              <button
                type="button"
                className="btn-text"
                style={{ padding: 0, fontSize: '0.875rem' }}
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotSuccess(false);
                  setForgotEmail('');
                }}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={<ArrowRight size={18} />}
            >
              Sign In
            </Button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Password"
      >
        {forgotSuccess ? (
          <div>
            <div className="auth-alert auth-alert-success">
              Password reset link sent! Check your email inbox for instructions.
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setForgotModalOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit}>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              Enter your registered email address and we'll send you a link to reset your password.
            </p>
            <Input
              label="Email Address"
              type="email"
              name="forgotEmail"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="alex@example.com"
              icon={<Mail size={18} />}
              required
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button variant="outline" onClick={() => setForgotModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
