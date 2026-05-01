import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match. Please try again.');
      setIsError(true);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const response = await axios.post('http://localhost:8080/api/auth/register', payload);
      setMessage(response.data);
      setIsError(false);
      setFormData({ userId: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data || 'An error occurred during registration.');
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
        <p>Create your OCMS account to start submitting and tracking campus facility complaints.</p>

        <div className="auth-brand-facts">
          <div className="auth-brand-fact">
            <div className="fact-icon"><i className="bi bi-person-check"></i></div>
            <span>Verify your College ID to confirm active enrollment</span>
          </div>
          <div className="auth-brand-fact">
            <div className="fact-icon"><i className="bi bi-send-check"></i></div>
            <span>Submit complaints for any campus building or facility</span>
          </div>
          <div className="auth-brand-fact">
            <div className="fact-icon"><i className="bi bi-bell"></i></div>
            <span>Get notified when your complaint status changes</span>
          </div>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div className="auth-form-panel">
        <div className="auth-form-box fade-in-up" style={{ maxWidth: '460px' }}>
          <h2>Create Account</h2>
          <p className="subtitle">Fill in your details to get started with OCMS.</p>

          {message && (
            <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} mb-4`} role="alert">
              <i className={`bi ${isError ? 'bi-exclamation-circle' : 'bi-check-circle'} me-2`}></i>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-modern">
            <div className="row g-3 mb-1">
              <div className="col-sm-6">
                <label htmlFor="name">Full Name</label>
                <input id="name" type="text" name="name" className="form-control"
                  placeholder="Your full name" required
                  value={formData.name} onChange={handleChange} />
              </div>
              <div className="col-sm-6">
                <label htmlFor="userId">College ID</label>
                <input id="userId" type="text" name="userId" className="form-control"
                  placeholder="e.g., 23mcce11" required
                  value={formData.userId} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-3 mt-2">
              <label htmlFor="email">University Email</label>
              <input id="email" type="email" name="email" className="form-control"
                placeholder="you@uohyd.ac.in" required
                value={formData.email} onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" type="tel" name="phone" className="form-control"
                placeholder="10-digit mobile number" required
                pattern="[6-9]\d{9}"
                title="Enter a valid 10-digit Indian mobile number"
                value={formData.phone} onChange={handleChange} />
            </div>

            <div className="row g-3 mb-4">
              <div className="col-sm-6">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" name="password" className="form-control"
                  placeholder="Create a password" required minLength={6}
                  value={formData.password} onChange={handleChange} />
              </div>
              <div className="col-sm-6">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" name="confirmPassword" className="form-control"
                  placeholder="Repeat password" required
                  value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-grad w-100 justify-content-center"
              style={{ padding: '0.65rem 1rem', fontSize: '0.95rem', borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Creating account…</>
              ) : (
                <><i className="bi bi-person-plus me-2"></i>Create Account</>
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-sm" style={{ color: 'var(--clr-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;