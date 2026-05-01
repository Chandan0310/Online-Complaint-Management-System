/**
 * @file AdminComplaintsView.jsx
 * @description Admin sub-component that displays a filterable, searchable
 *              table of all complaints across the university.  Supports
 *              status filter, building filter, and complaint ID search.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getStatusBadge } from '../utils/statusBadge';

/**
 * AdminComplaintsView component — fetches every complaint and renders a
 * sortable, filterable, searchable table with clickable rows.
 *
 * @returns {JSX.Element} University-wide complaints card.
 */
const AdminComplaintsView = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  /** Search input for complaint tracking ID */
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, locRes] = await Promise.all([
          api.get('/admin/complaints'),
          api.get('/locations/all-admin'),
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

  /** Apply all filters: status + building + ID search */
  const filtered = complaints.filter((c) => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchLoc = !locationFilter || c.location?.locationId.toString() === locationFilter;
    const matchSearch = !searchId || c.complaintId.toLowerCase().includes(searchId.toLowerCase());
    return matchStatus && matchLoc && matchSearch;
  });

  const hasActiveFilters = statusFilter || locationFilter || searchId;

  return (
    <div className="card-modern">
      <div className="card-modern-header gradient">
        <h5><i className="bi bi-globe-americas"></i> University-Wide Complaints</h5>
        <span style={{
          background: 'rgba(255,255,255,0.22)', color: '#fff',
          padding: '0.2rem 0.65rem', borderRadius: 20,
          fontSize: '0.8rem', fontWeight: 600,
        }}>
          {filtered.length} results
        </span>
      </div>

      {/* Filter + Search bar */}
      <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
        {/* Search by ID */}
        <i className="bi bi-search" style={{ color: 'var(--clr-text-muted)' }}></i>
        <input
          type="text"
          placeholder="Search by Complaint ID…"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{
            border: '1.5px solid var(--clr-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.75rem',
            fontSize: '0.82rem',
            color: 'var(--clr-text)',
            background: '#fff',
            fontFamily: 'var(--font-base)',
            minWidth: '180px',
          }}
        />
        <span style={{ color: 'var(--clr-border)' }}>|</span>

        {/* Status filter */}
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

        {/* Building filter */}
        <label>Building:</label>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All Buildings</option>
          {locations.map((loc) => (
            <option key={loc.locationId} value={loc.locationId}>{loc.buildingName}</option>
          ))}
        </select>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            onClick={() => { setStatusFilter(''); setLocationFilter(''); setSearchId(''); }}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--clr-rejected)', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            <i className="bi bi-x-circle"></i> Clear all
          </button>
        )}
      </div>

      {/* Content */}
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