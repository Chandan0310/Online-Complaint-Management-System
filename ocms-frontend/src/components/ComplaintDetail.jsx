import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- Re-usable helper ---
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

// --- Visual Stepper ---
const StatusStepper = ({ status }) => {
  const stages = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED'];
  const labels = ['Pending', 'Accepted', 'In Progress', 'Resolved'];

  if (status === 'REJECTED') {
    return (
      <div className="stepper">
        <div className="stepper-step">
          <div className="stepper-circle completed"><i className="bi bi-check"></i></div>
          <div className="stepper-label completed">Pending</div>
        </div>
        <div className="stepper-connector filled"></div>
        <div className="stepper-step">
          <div className="stepper-circle rejected"><i className="bi bi-x"></i></div>
          <div className="stepper-label rejected">Rejected</div>
        </div>
      </div>
    );
  }

  const currentIndex = stages.indexOf(status);

  return (
    <div className="stepper">
      {stages.map((stage, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isResolved = stage === 'RESOLVED' && isActive;

        let circleClass = 'stepper-circle';
        let labelClass = 'stepper-label';
        if (isResolved || isCompleted) { circleClass += ' completed'; labelClass += ' completed'; }
        else if (isActive)             { circleClass += ' active';    labelClass += ' active'; }

        return (
          <React.Fragment key={stage}>
            <div className="stepper-step">
              <div className={circleClass}>
                {(isCompleted || isResolved)
                  ? <i className="bi bi-check"></i>
                  : isActive
                    ? <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i>
                    : <i className="bi bi-circle" style={{ fontSize: '0.75rem' }}></i>
                }
              </div>
              <div className={labelClass}>{labels[idx]}</div>
            </div>
            {idx < stages.length - 1 && (
              <div className={`stepper-connector ${isCompleted ? 'filled' : ''}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// --- Main Component ---
const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/complaints/${id}`);
        setComplaint(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load complaint details. You may not have permission.');
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
      <p style={{ color: 'var(--clr-text-muted)', margin: 0 }}>Loading complaint details…</p>
    </div>
  );

  if (error) return (
    <div className="page-wrap">
      <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>
    </div>
  );

  if (!complaint) return null;

  return (
    <div>
      {/* Mini top bar */}
      <div className="ocms-topbar">
        <button className="btn-outline-modern" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="complaint-id">{complaint.complaintId}</span>
          {getStatusBadge(complaint.status)}
        </div>
      </div>

      <div className="page-wrap fade-in">
        <div className="card-modern">
          {/* Header */}
          <div className="card-modern-header gradient">
            <h5><i className="bi bi-file-earmark-text"></i> Complaint Details</h5>
          </div>

          {/* Stepper */}
          <div style={{ borderBottom: '1px solid var(--clr-border)', background: '#fafbff', padding: '0 1rem' }}>
            <StatusStepper status={complaint.status} />
          </div>

          <div className="card-modern-body">
            <div className="row g-4">
              {/* Left: Info */}
              <div className="col-md-7">
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{complaint.title}</h4>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  <i className="bi bi-geo-alt me-1"></i>
                  {complaint.location?.buildingName}
                  <span style={{ margin: '0 0.5rem' }}>·</span>
                  Submitted on {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>

                <div className="section-heading">Description</div>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  fontSize: '0.9rem',
                  color: 'var(--clr-text-2)',
                  lineHeight: 1.7,
                  minHeight: '100px'
                }}>
                  {complaint.description}
                </div>

                {/* Manager Remarks */}
                {(complaint.status === 'RESOLVED' || complaint.status === 'REJECTED') && (
                  <div className={`alert ${complaint.status === 'RESOLVED' ? 'alert-success' : 'alert-danger'} mt-4`}>
                    <strong><i className={`bi ${complaint.status === 'RESOLVED' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>Manager's Remarks</strong>
                    <p style={{ margin: '0.4rem 0 0' }}>{complaint.remarks || 'No remarks provided.'}</p>
                  </div>
                )}
              </div>

              {/* Right: Images */}
              <div className="col-md-5">
                <div className="section-heading">Submitted Evidence</div>
                {complaint.submittedImagePath ? (
                  <div style={{
                    border: '1px solid var(--clr-border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: '#f8fafc'
                  }}>
                    <img
                      src={`http://localhost:8080/uploads/${complaint.submittedImagePath}`}
                      alt="Complaint Evidence"
                      style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', display: 'block', padding: '0.5rem' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    border: '2px dashed var(--clr-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2.5rem',
                    textAlign: 'center',
                    color: 'var(--clr-text-muted)'
                  }}>
                    <i className="bi bi-image" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                    No photo attached
                  </div>
                )}

                {complaint.resolvedImagePath && (
                  <>
                    <div className="section-heading mt-4">Resolution Proof</div>
                    <div style={{
                      border: '1px solid var(--clr-resolved)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: '#f0fdf4'
                    }}>
                      <img
                        src={`http://localhost:8080/uploads/${complaint.resolvedImagePath}`}
                        alt="Resolution Evidence"
                        style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', display: 'block', padding: '0.5rem' }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;