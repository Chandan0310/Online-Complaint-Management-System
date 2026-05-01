/**
 * @file StudentDashboard.jsx
 * @description Main dashboard for student users.  Composes the complaint
 *              history table and complaint submission form into a single
 *              page with a hero banner and top navigation bar.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitComplaint from './SubmitComplaint';
import ComplaintHistory from './ComplaintHistory';

/**
 * StudentDashboard component — top-level page for authenticated students.
 * Shows a personalised greeting, the student's complaint history, and a
 * complaint submission form.
 *
 * @returns {JSX.Element} Student dashboard page.
 */
const StudentDashboard = () => {
  const navigate = useNavigate();

  /** Display name of the logged-in student */
  const name = localStorage.getItem('name') || 'Student';
  /** College ID shown in the hero banner */
  const userId = localStorage.getItem('userId') || '';

  /** Two-letter initials derived from the student's name */
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  /**
   * Clears authentication state and redirects to the login page.
   */
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Top navigation bar */}
      <div className="ocms-topbar">
        <div className="brand">
          <div className="brand-icon"><i className="bi bi-megaphone-fill"></i></div>
          <span>OCMS</span>
        </div>
        <div className="nav-actions">
          <button className="btn-outline-modern" onClick={() => navigate('/profile')}>
            <i className="bi bi-person-circle"></i>
            {name}
          </button>
          <button className="btn-danger-modern" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="page-wrap fade-in">
        {/* Hero banner */}
        <div className="hero-banner">
          <div className="user-chip mb-3" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            <div className="avatar" style={{ background: 'rgba(255,255,255,0.3)' }}>{initials}</div>
            {userId}
          </div>
          <h4>Welcome back, {name}!</h4>
          <p>Track your existing complaints or submit a new one below.</p>
        </div>

        {/* Complaint history section */}
        <div className="section-heading"><i className="bi bi-list-check"></i> My Complaints</div>
        <ComplaintHistory />

        <div className="divider" style={{ margin: '2rem 0' }} />

        {/* New complaint section */}
        <div className="section-heading"><i className="bi bi-plus-circle"></i> Submit New Complaint</div>
        <SubmitComplaint />
      </div>
    </>
  );
};

export default StudentDashboard;