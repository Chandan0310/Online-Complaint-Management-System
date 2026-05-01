/**
 * @file ComplaintHistory.jsx
 * @description Student sub-component that lists all complaints the logged-in
 *              student has submitted, sorted newest-first.  Rows are clickable
 *              and navigate to the detailed complaint view.
 *              Rendered inside {@link StudentDashboard}.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getStatusBadge } from '../utils/statusBadge';

/**
 * ComplaintHistory component — fetches the current student's complaints
 * from `/api/complaints/my-complaints` and renders them in a table.
 *
 * @returns {JSX.Element} Complaint history card.
 */
const ComplaintHistory = () => {
  /** Student's complaints sorted newest-first */
  const [complaints, setComplaints] = useState([]);
  /** Whether the initial fetch is still in-flight */
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* Fetch and sort on mount */
  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const response = await api.get('/complaints/my-complaints');
        const sorted = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
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

  /* Loading state */
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
      {/* Header with total count badge */}
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
          fontWeight: 600,
        }}>
          {complaints.length} total
        </span>
      </div>

      {/* Empty state or complaint table */}
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
                  <td><span className="complaint-id">{c.complaintId}</span></td>
                  <td><strong style={{ color: 'var(--clr-text)' }}>{c.title}</strong></td>
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