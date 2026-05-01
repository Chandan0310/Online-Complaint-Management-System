/**
 * @file Login.jsx
 * @description Authentication page for all OCMS users (Students, Managers,
 *              and Admins).  On successful login the JWT token and user
 *              metadata are persisted to localStorage and the user is
 *              redirected to their role-specific dashboard.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { COLLEGE_ID_PATTERN, COLLEGE_ID_MSG } from '../utils/validationPatterns';

/**
 * Login component — renders a College-ID / password form, authenticates via
 * the `/api/auth/login` endpoint, and performs role-based navigation.
 *
 * @returns {JSX.Element} The login page layout.
 */
const Login = () => {
  /** Login credentials */
  const [formData, setFormData] = useState({ userId: '', password: '' });
  /** Feedback message (error / success) */
  const [message, setMessage] = useState('');
  /** Whether the message represents an error */
  const [isError, setIsError] = useState(false);
  /** Disables the button during an API call */
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /**
   * Updates the matching key in formData on every keystroke.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Submits credentials to `/api/auth/login`.  On success, stores the JWT
   * token and user details in localStorage, then redirects based on role.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);

      /* Persist authentication state */
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('name', response.data.name);

      /* Role-based redirect */
      if (response.data.role === 'MANAGER') {
        navigate('/manager-dashboard');
      } else if (response.data.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage(error.response?.data || 'Invalid credentials. Please try again.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Left: Branding Panel */}
      <div className="auth-brand-panel fade-in">
        <div className="brand-logo">🎓</div>
        <h1>University of<br />Hyderabad</h1>
        <p>Online Complaint Management System — report and track campus infrastructure issues with ease.</p>

        <div className="auth-brand-facts">
          <div className="auth-brand-fact">
            <div className="fact-icon"><i className="bi bi-shield-check"></i></div>
            <span>Secure, role-based access for Students, Managers &amp; Admin</span>
          </div>
          <div className="auth-brand-fact">
            <div className="fact-icon"><i className="bi bi-clock-history"></i></div>
            <span>Real-time complaint tracking from submission to resolution</span>
          </div>
          <div className="auth-brand-fact">
            <div className="fact-icon"><i className="bi bi-building"></i></div>
            <span>Covering all university buildings and facilities</span>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="auth-form-panel">
        <div className="auth-form-box fade-in-up">
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to your OCMS account to continue.</p>

          {/* Feedback alert */}
          {message && (
            <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} mb-4`} role="alert">
              <i className={`bi ${isError ? 'bi-exclamation-circle' : 'bi-check-circle'} me-2`}></i>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-modern">
            {/* College ID */}
            <div className="mb-3">
              <label htmlFor="userId">College ID</label>
              <input
                id="userId"
                type="text"
                name="userId"
                className="form-control"
                placeholder="Enter your college ID"
                required
               // pattern={COLLEGE_ID_PATTERN}
                title={COLLEGE_ID_MSG}
                value={formData.userId}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-grad w-100 justify-content-center"
              style={{ padding: '0.65rem 1rem', fontSize: '0.95rem', borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing in…</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-sm" style={{ color: 'var(--clr-text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;