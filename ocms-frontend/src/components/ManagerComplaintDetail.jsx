import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const ManagerComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [resolvedImage, setResolvedImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this complaint as "${newStatus.replace('_', ' ')}"?`)) return;

    setActionLoading(true);
    const formData = new FormData();
    formData.append('status', newStatus);
    if (remarks) formData.append('remarks', remarks);
    if (resolvedImage) formData.append('resolvedImage', resolvedImage);

    try {
      await api.put(`/complaints/${id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDetails();
      setRemarks('');
      setResolvedImage(null);
    } catch (error) {
      alert('Error updating complaint. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
    </div>
  );

  if (!complaint) return null;

  return (
    <div>
      {/* Top Bar */}
      <div className="ocms-topbar">
        <button className="btn-outline-modern" onClick={() => navigate('/manager-dashboard')}>
          <i className="bi bi-arrow-left"></i> Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="complaint-id">{complaint.complaintId}</span>
          {getStatusBadge(complaint.status)}
        </div>
      </div>

      <div className="page-wrap fade-in">
        <div className="card-modern">
          <div className="card-modern-header gradient">
            <h5><i className="bi bi-clipboard-check"></i> Manage Complaint</h5>
          </div>

          <div className="card-modern-body">
            <div className="row g-4">
              {/* LEFT: Student Info + Complaint */}
              <div className="col-md-7">
                {/* Student Info */}
                <div className="section-heading"><i className="bi bi-person"></i> Student Information</div>
                <div style={{
                  background: 'var(--clr-primary-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '2rem',
                  flexWrap: 'wrap'
                }}>
                  <div className="info-row" style={{ margin: 0 }}>
                    <label>Name</label>
                    <span>{complaint.student?.name}</span>
                  </div>
                  <div className="info-row" style={{ margin: 0 }}>
                    <label>College ID</label>
                    <span style={{ fontFamily: 'monospace' }}>{complaint.student?.userId}</span>
                  </div>
                  <div className="info-row" style={{ margin: 0 }}>
                    <label>Phone</label>
                    <span>{complaint.student?.phone}</span>
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="section-heading"><i className="bi bi-file-text"></i> Complaint Details</div>
                <h5 style={{ marginBottom: '0.35rem' }}>{complaint.title}</h5>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  <i className="bi bi-geo-alt me-1"></i>{complaint.location?.buildingName}
                  <span style={{ margin: '0 0.5rem' }}>·</span>
                  {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>

                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: 'var(--clr-text-2)',
                  marginBottom: '1.25rem'
                }}>
                  {complaint.description}
                </div>

                {complaint.submittedImagePath && (
                  <div style={{ border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <img
                      src={`http://localhost:8080/uploads/${complaint.submittedImagePath}`}
                      alt="Submitted Evidence"
                      style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', background: '#f8fafc', padding: '0.5rem' }}
                    />
                  </div>
                )}
              </div>

              {/* RIGHT: Actions */}
              <div className="col-md-5">
                <div className="section-heading"><i className="bi bi-sliders"></i> Manager Actions</div>

                {/* PENDING → Accept or Reject */}
                {complaint.status === 'PENDING' && (
                  <div className="form-modern">
                    <p style={{ color: 'var(--clr-text-2)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      This is a new complaint. Review the details and accept or reject it.
                    </p>
                    <div className="mb-3">
                      <label>Remarks (optional, required if rejecting)</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="e.g., Duplicate complaint / will not be addressed because…"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        className="btn-success-modern"
                        style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}
                        onClick={() => handleUpdateStatus('ACCEPTED')}
                        disabled={actionLoading}
                      >
                        <i className="bi bi-check-circle me-1"></i> Accept
                      </button>
                      <button
                        className="btn-danger-modern"
                        style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}
                        onClick={() => handleUpdateStatus('REJECTED')}
                        disabled={actionLoading}
                      >
                        <i className="bi bi-x-circle me-1"></i> Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* ACCEPTED → Start Work */}
                {complaint.status === 'ACCEPTED' && (
                  <div>
                    <div style={{
                      background: 'var(--clr-accepted-bg)',
                      border: '1px solid var(--clr-accepted)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      color: '#1e40af'
                    }}>
                      <i className="bi bi-check-circle me-2"></i>
                      Complaint accepted. Click below to start work.
                    </div>
                    <button
                      className="btn-grad"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      disabled={actionLoading}
                    >
                      <i className="bi bi-play-circle me-2"></i> Start Work (Mark In Progress)
                    </button>
                  </div>
                )}

                {/* IN_PROGRESS → Resolve */}
                {complaint.status === 'IN_PROGRESS' && (
                  <div className="form-modern">
                    <div style={{
                      background: 'var(--clr-resolved-bg)',
                      border: '1px solid var(--clr-resolved)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1.1rem',
                      marginBottom: '1.25rem',
                      fontSize: '0.875rem',
                      color: '#065f46'
                    }}>
                      <i className="bi bi-gear-fill me-2"></i>
                      Work is in progress. Upload proof and remarks to resolve.
                    </div>
                    <div className="mb-3">
                      <label>Resolution Remarks <span style={{ color: 'var(--clr-rejected)' }}>*</span></label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="Describe what was done to fix the issue…"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label>Proof Image <span style={{ color: 'var(--clr-rejected)' }}>*</span></label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        required
                        onChange={(e) => setResolvedImage(e.target.files[0])}
                      />
                    </div>
                    <button
                      className="btn-success-modern"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.9rem', borderRadius: '8px' }}
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      disabled={!remarks || !resolvedImage || actionLoading}
                    >
                      <i className="bi bi-patch-check me-2"></i> Mark as Resolved
                    </button>
                  </div>
                )}

                {/* Closed */}
                {(complaint.status === 'RESOLVED' || complaint.status === 'REJECTED') && (
                  <div className={`alert ${complaint.status === 'RESOLVED' ? 'alert-success' : 'alert-danger'}`}>
                    <strong>
                      <i className={`bi ${complaint.status === 'RESOLVED' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                      Ticket Closed — {complaint.status}
                    </strong>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.875rem' }}>
                      {complaint.remarks || 'No remarks recorded.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerComplaintDetail;