import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitComplaint from './SubmitComplaint';
import ComplaintHistory from './ComplaintHistory';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Student';
  const userId = localStorage.getItem('userId') || '';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Top Bar */}
      <div className="ocms-topbar">
        <div className="brand">
          <div className="brand-icon"><i className="bi bi-megaphone-fill"></i></div>
          <span>OCMS</span>
        </div>
        <div className="nav-actions">
          <button
            className="btn-outline-modern"
            onClick={() => navigate('/profile')}
          >
            <i className="bi bi-person-circle"></i>
            {name}
          </button>
          <button className="btn-danger-modern" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-wrap fade-in">
        {/* Hero Banner */}
        <div className="hero-banner">
          <div className="user-chip mb-3" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            <div className="avatar" style={{ background: 'rgba(255,255,255,0.3)' }}>{initials}</div>
            {userId}
          </div>
          <h4>Welcome back, {name}!</h4>
          <p>Track your existing complaints or submit a new one below.</p>
        </div>

        {/* My Complaints */}
        <div className="section-heading"><i className="bi bi-list-check"></i> My Complaints</div>
        <ComplaintHistory />

        <div className="divider" style={{ margin: '2rem 0' }} />

        {/* Submit Complaint */}
        <div className="section-heading"><i className="bi bi-plus-circle"></i> Submit New Complaint</div>
        <SubmitComplaint />
      </div>
    </>
  );
};

export default StudentDashboard;