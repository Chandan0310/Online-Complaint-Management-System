import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [newBuilding, setNewBuilding] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations/all');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations', error);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

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

  return (
    <div className="card-modern mb-4">
      <div className="card-modern-header">
        <h5>
          <i className="bi bi-building" style={{ color: 'var(--clr-primary)' }}></i>
          Manage University Buildings
        </h5>
        <span style={{
          background: 'var(--clr-primary-light)',
          color: 'var(--clr-primary-dark)',
          padding: '0.2rem 0.65rem',
          borderRadius: 20,
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {locations.length} locations
        </span>
      </div>

      <div className="card-modern-body">
        <div className="row g-4">
          {/* Add Form */}
          <div className="col-md-5">
            <div className="section-heading">Add New Building</div>
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
                />
              </div>
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

          {/* Location List */}
          <div className="col-md-7">
            <div className="section-heading">Active Locations</div>
            <div style={{ overflowY: 'auto', maxHeight: '280px' }}>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Building Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '2rem' }}>
                        No locations found.
                      </td>
                    </tr>
                  ) : (
                    locations.map((loc) => (
                      <tr key={loc.locationId}>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--clr-text-muted)' }}>#{loc.locationId}</span></td>
                        <td><strong>{loc.buildingName}</strong></td>
                        <td><span className="badge-status badge-resolved"><i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i> Active</span></td>
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