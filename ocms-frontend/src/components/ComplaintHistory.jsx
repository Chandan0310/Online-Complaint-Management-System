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

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const response = await api.get('/complaints/my-complaints');
        const sorted = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComplaints(sorted);
      } catch (error) {
        console.error('Error fetching complaints', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyComplaints();
  }, []);

  if (loading) {
    return (
      <div className="card-modern" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <p style={{ color: 'var(--clr-text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
          Fetching your complaints…
        </p>
      </div>
    );
  }

  return (
    <div className="card-modern fade-in-up">
      <div className="card-modern-header">
        <h5>
          <i className="bi bi-card-list" style={{ color: 'var(--clr-primary)' }}></i>
          Complaint History
        </h5>
        <span style={{
          background: 'var(--clr-primary-light)',
          color: 'var(--clr-primary-dark)',
          padding: '0.2rem 0.65rem',
          borderRadius: 20,
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {complaints.length} total
        </span>
      </div>

      {complaints.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
          <i className="bi bi-inbox" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}></i>
          <p style={{ margin: 0 }}>You haven't submitted any complaints yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Title</th>
                <th>Building</th>
                <th>Date Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.complaintId} onClick={() => navigate(`/complaint/${c.complaintId}`)}>
                  <td>
                    <span className="complaint-id">{c.complaintId}</span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--clr-text)' }}>{c.title}</strong>
                  </td>
                  <td style={{ color: 'var(--clr-text-2)' }}>
                    <i className="bi bi-geo-alt me-1" style={{ color: 'var(--clr-text-muted)' }}></i>
                    {c.location?.buildingName}
                  </td>
                  <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>{getStatusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComplaintHistory;