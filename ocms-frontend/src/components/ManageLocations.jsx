/**
 * @file ManageLocations.jsx
 * @description Admin sub-component for adding new university buildings,
 *              toggling their active/inactive status, and viewing all
 *              registered locations.  Rendered inside {@link AdminDashboard}.
 */

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { BUILDING_NAME_PATTERN, BUILDING_NAME_MSG } from '../utils/validationPatterns';

/**
 * ManageLocations component — split layout with a creation form on the left
 * and a scrollable table of all locations (active + inactive) on the right.
 * Admins can toggle a building's active status; inactive buildings are
 * hidden from student-facing dropdowns.
 *
 * @returns {JSX.Element} Location management card.
 */
const ManageLocations = () => {
  /** All locations (active + inactive) from the admin endpoint */
  const [locations, setLocations] = useState([]);
  /** Value of the "new building" text input */
  const [newBuilding, setNewBuilding] = useState('');
  /** Success / error feedback */
  const [message, setMessage] = useState('');
  /** Disables the submit button during an API call */
  const [loading, setLoading] = useState(false);

  /**
   * Fetches ALL locations (including inactive) from the admin endpoint.
   */
  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations/all-admin');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations', error);
    }
  };

  /* Load locations on mount */
  useEffect(() => { fetchLocations(); }, []);

  /**
   * Submits the new building name to `/api/locations/add`.
   * Refreshes the location list and clears the input on success.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newBuilding.trim()) return;
    setLoading(true);
    try {
      await api.post('/locations/add', { buildingName: newBuilding });
      setMessage({ type: 'success', text: `"${newBuilding}" added successfully!` });
      setNewBuilding('');
      fetchLocations();
      setTimeout(() => setMessage(''), 3500);
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data || 'Error adding building.' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles a building's active/inactive status via PUT.
   *
   * @param {number} locationId
   */
  const handleToggleStatus = async (locationId) => {
    try {
      const response = await api.put(`/locations/${locationId}/toggle-status`);
      setMessage({ type: 'success', text: response.data });
      fetchLocations();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data || 'Error toggling status.' });
    }
  };

  /** Count of active locations */
  const activeCount = locations.filter((l) => l.active).length;

  return (
    <div className="card-modern mb-4">
      {/* Card header with location count badge */}
      <div className="card-modern-header">
        <h5>
          <i className="bi bi-building" style={{ color: 'var(--clr-primary)' }}></i>
          Manage University Buildings
        </h5>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{
            background: 'var(--clr-primary-light)',
            color: 'var(--clr-primary-dark)',
            padding: '0.2rem 0.65rem',
            borderRadius: 20,
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            {activeCount} active
          </span>
          {locations.length - activeCount > 0 && (
            <span style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '0.2rem 0.65rem',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              {locations.length - activeCount} inactive
            </span>
          )}
        </div>
      </div>

      <div className="card-modern-body">
        <div className="row g-4">
          {/* ---- Left column: Add form ---- */}
          <div className="col-md-5">
            <div className="section-heading">Add New Building</div>

            {/* Feedback alert */}
            {message && (
              <div className={`alert alert-${message.type} mb-3`}>
                <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
                {message.text}
              </div>
            )}

            <form onSubmit={handleAddLocation} className="form-modern">
              <div className="mb-3">
                <label>Building Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., School of Physics"
                  value={newBuilding}
                  onChange={(e) => setNewBuilding(e.target.value)}
                  required
                  pattern={BUILDING_NAME_PATTERN}
                  title={BUILDING_NAME_MSG}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-grad"
                style={{ padding: '0.55rem 1.25rem', borderRadius: '8px' }}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Adding…</>
                  : <><i className="bi bi-plus-circle me-2"></i>Add to System</>
                }
              </button>
            </form>
          </div>

          {/* ---- Right column: Location list ---- */}
          <div className="col-md-7">
            <div className="section-heading">All Locations</div>
            <div style={{ overflowY: 'auto', maxHeight: '320px' }}>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Building Name</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '2rem' }}>
                        No locations found.
                      </td>
                    </tr>
                  ) : (
                    locations.map((loc) => (
                      <tr key={loc.locationId} style={{ opacity: loc.active ? 1 : 0.6 }}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--clr-text-muted)' }}>
                            #{loc.locationId}
                          </span>
                        </td>
                        <td><strong>{loc.buildingName}</strong></td>
                        <td>
                          {loc.active ? (
                            <span className="badge-status badge-resolved">
                              <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i> Active
                            </span>
                          ) : (
                            <span className="badge-status badge-rejected">
                              <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i> Inactive
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleStatus(loc.locationId)}
                            title={loc.active ? 'Deactivate this building' : 'Activate this building'}
                            style={{
                              background: loc.active ? '#fef2f2' : '#f0fdf4',
                              color: loc.active ? '#b91c1c' : '#15803d',
                              border: `1px solid ${loc.active ? '#fecaca' : '#bbf7d0'}`,
                              borderRadius: '6px',
                              padding: '0.3rem 0.75rem',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'var(--transition)',
                            }}
                          >
                            <i className={`bi ${loc.active ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                            {loc.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLocations;