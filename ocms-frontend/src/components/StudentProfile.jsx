import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passMessage, setPassMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMessage('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassMessage({ type: 'danger', text: 'New passwords do not match!' });
      return;
    }
    try {
      const response = await api.post('/users/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      setPassMessage({ type: 'success', text: response.data });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPassMessage({ type: 'danger', text: error.response?.data || 'Failed to change password.' });
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
    </div>
  );

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ST';

  return (
    <div>
      <div className="ocms-topbar">
        <button className="btn-outline-modern" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-arrow-left"></i> Dashboard
        </button>
        <div className="brand">
          <div className="brand-icon"><i className="bi bi-megaphone-fill"></i></div>
          <span>My Profile</span>
        </div>
      </div>

      <div className="page-wrap fade-in">
        <div className="row g-4">
          {/* Profile Card */}
          <div className="col-md-4">
            <div className="card-modern h-100">
              <div className="card-modern-header gradient">
                <h5><i className="bi bi-person-badge"></i> Student Profile</h5>
              </div>
              <div className="card-modern-body" style={{ textAlign: 'center', paddingTop: '2rem' }}>
                <div className="profile-avatar mx-auto">{initials}</div>
                <h5 style={{ marginBottom: '0.25rem' }}>{profile?.name}</h5>
                <span className="badge-status badge-accepted" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                  <i className="bi bi-mortarboard"></i> Student
                </span>

                <div className="divider"></div>

                <div style={{ textAlign: 'left' }}>
                  <div className="info-row">
                    <label>College ID</label>
                    <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{profile?.userId}</span>
                  </div>
                  <div className="info-row">
                    <label>Email Address</label>
                    <span>{profile?.email}</span>
                  </div>
                  <div className="info-row">
                    <label>Phone Number</label>
                    <span>{profile?.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="col-md-8">
            <div className="card-modern">
              <div className="card-modern-header">
                <h5>
                  <i className="bi bi-shield-lock" style={{ color: 'var(--clr-primary)' }}></i>
                  Security — Change Password
                </h5>
              </div>
              <div className="card-modern-body">
                {passMessage && (
                  <div className={`alert alert-${passMessage.type} mb-4`}>
                    <i className={`bi ${passMessage.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
                    {passMessage.text}
                  </div>
                )}
                <form onSubmit={handlePasswordChange} className="form-modern">
                  <div className="mb-3">
                    <label>Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      placeholder="Enter your current password"
                      value={passwords.oldPassword}
                      onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                    />
                  </div>
                  <div className="divider"></div>
                  <div className="row g-3 mb-4">
                    <div className="col-sm-6">
                      <label>New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        required
                        minLength={6}
                        placeholder="Enter new password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        required
                        placeholder="Re-enter new password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-grad"
                    style={{ padding: '0.6rem 1.5rem', borderRadius: '8px' }}
                  >
                    <i className="bi bi-key me-2"></i>Update Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;