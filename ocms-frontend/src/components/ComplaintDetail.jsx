/**
 * @file ComplaintDetail.jsx
 * @description Read-only detail view for a single complaint.  Accessible to
 *              the student who submitted the complaint and to admins.
 *              Includes a visual status stepper and displays submitted /
 *              resolved evidence images.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getStatusBadge } from '../utils/statusBadge';

/**
 * Visual stepper that renders the complaint lifecycle as a horizontal
 * progress tracker.  Handles both the normal flow
 * (PENDING → ACCEPTED → IN_PROGRESS → RESOLVED) and the rejection path.
 *
 * @param {Object}  props
 * @param {string}  props.status - Current complaint status.
 * @returns {JSX.Element} A horizontal stepper visualisation.
 */
const StatusStepper = ({ status }) => {
  const stages = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED'];
  const labels = ['Pending', 'Accepted', 'In Progress', 'Resolved'];

  /* Rejection is a terminal branch — show a two-step path */
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

/**
 * ComplaintDetail component — fetches and displays all information about a
 * single complaint identified by the `:id` URL parameter.
 *
 * @returns {JSX.Element} Complaint detail page layout.
 */
const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /** Fetched complaint object */
  const [complaint, setComplaint] = useState(null);
  /** Whether the API call is still in-flight */
  const [loading, setLoading] = useState(true);
  /** Error message if the fetch fails */
  const [error, setError] = useState('');

  /* Fetch complaint by ID on mount / when ID changes */
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

  /* Loading spinner */
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
      <p style={{ color: 'var(--clr-text-muted)', margin: 0 }}>Loading complaint details…</p>
    </div>
  );

  /* Error state */
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

          {/* Status stepper */}
          <div style={{ borderBottom: '1px solid var(--clr-border)', background: '#fafbff', padding: '0 1rem' }}>
            <StatusStepper status={complaint.status} />
          </div>

          <div className="card-modern-body">
            <div className="row g-4">
              {/* Left: textual details */}
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
                  minHeight: '100px',
                }}>
                  {complaint.description}
                </div>

                {/* Manager remarks (visible for resolved or rejected complaints) */}
                {(complaint.status === 'RESOLVED' || complaint.status === 'REJECTED') && (
                  <div className={`alert ${complaint.status === 'RESOLVED' ? 'alert-success' : 'alert-danger'} mt-4`}>
                    <strong><i className={`bi ${complaint.status === 'RESOLVED' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>Manager's Remarks</strong>
                    <p style={{ margin: '0.4rem 0 0' }}>{complaint.remarks || 'No remarks provided.'}</p>
                  </div>
                )}
              </div>

              {/* Right: evidence images */}
              <div className="col-md-5">
                <div className="section-heading">Submitted Evidence</div>
                {complaint.submittedImagePath ? (
                  <div style={{
                    border: '1px solid var(--clr-border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: '#f8fafc',
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
                    color: 'var(--clr-text-muted)',
                  }}>
                    <i className="bi bi-image" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                    No photo attached
                  </div>
                )}

                {/* Resolution proof image */}
                {complaint.resolvedImagePath && (
                  <>
                    <div className="section-heading mt-4">Resolution Proof</div>
                    <div style={{
                      border: '1px solid var(--clr-resolved)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: '#f0fdf4',
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