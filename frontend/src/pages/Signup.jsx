import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Compass, UserPlus } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { authService } from '../services/api';
import '../styles/auth.css';

export default function Signup({ onSignupSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

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

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      const response = await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (onSignupSuccess) {
        onSignupSuccess(response.user);
      }
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="auth-hero-title">Start Planning Unlimited Adventures</h1>
          <p className="auth-hero-subtitle">
            Join thousands of travelers crafting smart, budget-conscious, and personalized trips around the globe.
          </p>
        </div>

        <div className="auth-hero-footer">
          © 2026 GlobeTrotter Inc. Smart Travel Assistant.
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Sign up in seconds to personalize your travel itinerary</p>
          </div>

          {apiError && (
            <div className="auth-alert auth-alert-error">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Alex Morgan"
              icon={<User size={18} />}
              error={errors.name}
              required
            />

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
              placeholder="At least 6 characters"
              icon={<Lock size={18} />}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              icon={<Lock size={18} />}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={<UserPlus size={18} />}
              style={{ marginTop: '0.5rem' }}
            >
              Create Account
            </Button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
