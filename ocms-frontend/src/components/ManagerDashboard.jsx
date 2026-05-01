import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const getStatusBadge = (status) => {
  const map = {
    PENDING:     { cls: 'badge-status badge-pending',  icon: 'bi-hourglass-split', label: 'Pending' },
    ACCEPTED:    { cls: 'badge-status badge-accepted', icon: 'bi-check-circle',    label: 'Accepted' },
    IN_PROGRESS: { cls: 'badge-status badge-progress', icon: 'bi-gear',            label: 'In Progress' },
    RESOLVED:    { cls: 'badge-status badge-resolved', icon: 'bi-check-circle-fill', label: 'Resolved' },
    REJECTED:    { cls: 'badge-status badge-rejected', icon: 'bi-x-circle',        label: 'Rejected' },
  };
  const s = map[status] || { cls: 'badge-status', icon: 'bi-circle', label: status };
  return (
    <span className={s.cls}>
      <i className={`bi ${s.icon}`}></i> {s.label}
    </span>
  );
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Manager';
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaints/manager-complaints');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching building complaints', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filtered = statusFilter
    ? complaints.filter((c) => c.status === statusFilter)
    : complaints;

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <div className="ocms-topbar">
        <div className="brand">
          <div className="brand-icon"><i className="bi bi-tools"></i></div>
          <span>Manager Portal — OCMS</span>
        </div>
        <div className="nav-actions">
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            {name}
          </div>
          <button className="btn-danger-modern" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>

      <div className="page-wrap fade-in">
        {/* Hero */}
        <div className="hero-banner">
          <h4><i className="bi bi-tools me-2"></i>Welcome, {name}</h4>
          <p>Review and manage all complaints assigned to your building.</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {['PENDING', 'IN_PROGRESS', 'RESOLVED'].map((s) => {
              const count = complaints.filter((c) => c.status === s).length;
              return (
                <div key={s} style={{
                  background: 'rgba(255,255,255,0.18)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  color: '#fff',
                  backdropFilter: 'blur(4px)'
                }}>
                  <strong>{count}</strong> {s.replace('_', ' ').toLowerCase()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Complaints Table */}
        <div className="card-modern">
          <div className="card-modern-header">
            <h5>
              <i className="bi bi-list-task" style={{ color: 'var(--clr-primary)' }}></i>
              Building Complaints
            </h5>
            <div className="filter-bar" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--clr-text-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  border: '1.5px solid var(--clr-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.82rem',
                  color: 'var(--clr-text)',
                  background: '#fff',
                  fontFamily: 'var(--font-base)',
                }}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
              <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
              No complaints to display.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Title</th>
                    <th>Submitted By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.complaintId}
                      onClick={() => navigate(`/manager/complaint/${c.complaintId}`)}
                    >
                      <td><span className="complaint-id">{c.complaintId}</span></td>
                      <td><strong>{c.title}</strong></td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{c.student?.name}</span>
                        <br />
                        <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>{c.student?.userId}</span>
                      </td>
                      <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>{getStatusBadge(c.status)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-grad"
                          style={{ padding: '0.3rem 0.85rem', fontSize: '0.8rem', borderRadius: '6px' }}
                          onClick={() => navigate(`/manager/complaint/${c.complaintId}`)}
                        >
                          Review <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;