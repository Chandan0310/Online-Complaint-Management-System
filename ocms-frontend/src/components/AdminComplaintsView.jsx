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

const AdminComplaintsView = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, locRes] = await Promise.all([
          api.get('/admin/complaints'),
          api.get('/locations/all')
        ]);
        setComplaints(compRes.data);
        setLocations(locRes.data);
      } catch (error) {
        console.error('Error fetching admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = complaints.filter((c) => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchLoc = !locationFilter || c.location?.locationId.toString() === locationFilter;
    return matchStatus && matchLoc;
  });

  return (
    <div className="card-modern">
      <div className="card-modern-header gradient">
        <h5><i className="bi bi-globe-americas"></i> University-Wide Complaints</h5>
        <span style={{
          background: 'rgba(255,255,255,0.22)',
          color: '#fff',
          padding: '0.2rem 0.65rem',
          borderRadius: 20,
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {filtered.length} results
        </span>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <i className="bi bi-funnel" style={{ color: 'var(--clr-text-muted)' }}></i>
        <label>Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <span style={{ color: 'var(--clr-border)' }}>|</span>
        <label>Building:</label>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All Buildings</option>
          {locations.map((loc) => (
            <option key={loc.locationId} value={loc.locationId}>{loc.buildingName}</option>
          ))}
        </select>
        {(statusFilter || locationFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setLocationFilter(''); }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--clr-rejected)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <i className="bi bi-x-circle"></i> Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
          <i className="bi bi-search" style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}></i>
          No complaints match your filters.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
          <table className="table-modern">
            <thead style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th>Tracking ID</th>
                <th>Student</th>
                <th>Building</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.complaintId} onClick={() => navigate(`/complaint/${c.complaintId}`)}>
                  <td><span className="complaint-id">{c.complaintId}</span></td>
                  <td>
                    <strong>{c.student?.name}</strong>
                    <br /><span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>{c.student?.userId}</span>
                  </td>
                  <td style={{ color: 'var(--clr-text-2)' }}>{c.location?.buildingName}</td>
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

export default AdminComplaintsView;