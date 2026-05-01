import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ManageManagers = () => {
  const [managers, setManagers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    locationId: ''
  });

  const fetchData = async () => {
    try {
      const [mgrRes, locRes] = await Promise.all([
        api.get('/admin/managers'),
        api.get('/locations/all')
      ]);
      setManagers(mgrRes.data);
      setLocations(locRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddManager = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/admin/managers/add', formData);
      setMessage({ type: 'success', text: response.data });
      setFormData({ name: '', phone: '', email: '', password: '', locationId: '' });
      fetchData();
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data || 'Error adding manager.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-modern mb-4">
      <div className="card-modern-header">
        <h5>
          <i className="bi bi-people" style={{ color: 'var(--clr-primary)' }}></i>
          Manage Complaint Managers
        </h5>
        <span style={{
          background: 'var(--clr-primary-light)',
          color: 'var(--clr-primary-dark)',
          padding: '0.2rem 0.65rem',
          borderRadius: 20,
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {managers.length} managers
        </span>
      </div>

      <div className="card-modern-body">
        <div className="row g-4">
          {/* Create Form */}
          <div className="col-md-4">
            <div className="section-heading">Hire New Manager</div>

            {message && (
              <div className={`alert alert-${message.type} mb-3`}>
                <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
                {message.text}
              </div>
            )}

            <form onSubmit={handleAddManager} className="form-modern">
              <div className="mb-3">
                <label>Full Name</label>
                <input type="text" name="name" className="form-control" placeholder="Manager's full name"
                  required value={formData.name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input type="email" name="email" className="form-control" placeholder="manager@uohyd.ac.in"
                  required value={formData.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label>Phone Number</label>
                <input type="tel" name="phone" className="form-control" placeholder="10-digit number"
                  required value={formData.phone} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label>Assign to Building</label>
                <select name="locationId" className="form-control" required
                  value={formData.locationId} onChange={handleChange}>
                  <option value="">— Select Building —</option>
                  {locations.map((loc) => (
                    <option key={loc.locationId} value={loc.locationId}>{loc.buildingName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label>Temporary Password</label>
                <input type="password" name="password" className="form-control" placeholder="Set initial password"
                  required minLength={6} value={formData.password} onChange={handleChange} />
                <small style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                  Manager should change this on first login.
                </small>
              </div>
              <button
                type="submit"
                className="btn-grad"
                style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', width: '100%', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Creating…</>
                  : <><i className="bi bi-person-plus me-2"></i>Create Account</>
                }
              </button>
            </form>
          </div>

          {/* Manager List */}
          <div className="col-md-8">
            <div className="section-heading">Active Managers</div>
            <div style={{ overflowY: 'auto', maxHeight: '420px' }}>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Manager ID</th>
                    <th>Name & Email</th>
                    <th>Assigned Building</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '2rem' }}>
                        <i className="bi bi-people" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}></i>
                        No managers found.
                      </td>
                    </tr>
                  ) : (
                    managers.map((mgr) => (
                      <tr key={mgr.userId} style={{ cursor: 'default' }}>
                        <td>
                          <span className="complaint-id">{mgr.userId}</span>
                        </td>
                        <td>
                          <strong>{mgr.name}</strong>
                          <br />
                          <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>{mgr.email}</span>
                        </td>
                        <td>
                          {mgr.assignedLocation?.buildingName ? (
                            <span className="badge-status badge-accepted">
                              <i className="bi bi-building"></i> {mgr.assignedLocation.buildingName}
                            </span>
                          ) : (
                            <span className="badge-status badge-pending">
                              <i className="bi bi-exclamation-circle"></i> Unassigned
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--clr-text-2)', fontSize: '0.875rem' }}>{mgr.phone}</td>
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

export default ManageManagers;