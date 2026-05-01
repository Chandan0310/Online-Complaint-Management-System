import React from 'react';
import { useNavigate } from 'react-router-dom';
import ManageLocations from './ManageLocations';
import ManageManagers from './ManageManagers';
import AdminComplaintsView from './AdminComplaintsView';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Admin';

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Top Bar */}
      <div className="ocms-topbar">
        <div className="brand">
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
            <i className="bi bi-shield-fill-check"></i>
          </div>
          <span>Admin Portal — OCMS</span>
        </div>
        <div className="nav-actions">
          <div className="user-chip" style={{ background: '#f3e8ff', color: '#6b21a8' }}>
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>{initials}</div>
            {name}
          </div>
          <button className="btn-danger-modern" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>

      <div className="page-wrap fade-in">
        {/* Admin Hero */}
        <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #db2777 100%)' }}>
          <div className="user-chip mb-3" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            <div className="avatar" style={{ background: 'rgba(255,255,255,0.3)' }}>{initials}</div>
            System Administrator
          </div>
          <h4>Welcome, {name}</h4>
          <p>Full visibility and control over campus infrastructure, managers, and all complaints.</p>
        </div>

        {/* Section 1: Locations */}
        <div className="section-heading mt-3">
          <i className="bi bi-building"></i> Infrastructure Management
        </div>
        <ManageLocations />

        {/* Section 2: Managers */}
        <div className="section-heading mt-2">
          <i className="bi bi-people"></i> Personnel Management
        </div>
        <ManageManagers />

        {/* Section 3: Complaints */}
        <div className="section-heading mt-2">
          <i className="bi bi-globe-americas"></i> University-Wide Complaints
        </div>
        <AdminComplaintsView />
      </div>
    </>
  );
};

export default AdminDashboard;