/**
 * @file ManageManagers.jsx
 * @description Admin sub-component for creating and editing complaint managers.
 */

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  NAME_PATTERN, NAME_MSG,
  EMAIL_PATTERN, EMAIL_MSG,
  PHONE_PATTERN, PHONE_MSG,
  PASSWORD_PATTERN, PASSWORD_MSG,
} from '../utils/validationPatterns';

const ManageManagers = () => {
  const [managers, setManagers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', locationId: '',
  });

  const fetchData = async () => {
    try {
      const [mgrRes, locRes] = await Promise.all([
        api.get('/admin/managers'),
        api.get('/locations/all'),
      ]);
      setManagers(mgrRes.data);
      setLocations(locRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', password: '', locationId: '' });
  };

  const handleEdit = (mgr) => {
    setEditingId(mgr.userId);
    setFormData({
      name: mgr.name, phone: mgr.phone, email: mgr.email,
      password: '', locationId: mgr.assignedLocation?.locationId || '',
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const res = await api.put(`/admin/managers/${editingId}/update`, {
          name: formData.name, email: formData.email, phone: formData.phone,
        });
        setMessage({ type: 'success', text: res.data });
      } else {
        const res = await api.post('/admin/managers/add', formData);
        setMessage({ type: 'success', text: res.data });
      }
      resetForm();
      fetchData();
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data || 'Error processing request.' });
    } finally {
      setLoading(false);
    }
  };

  const assignedLocIds = managers.filter(m => m.assignedLocation).map(m => m.assignedLocation.locationId);

  return (
    <div className="card-modern mb-4">
      <div className="card-modern-header">
        <h5><i className="bi bi-people" style={{ color: 'var(--clr-primary)' }}></i> Manage Complaint Managers</h5>
        <span style={{ background: 'var(--clr-primary-light)', color: 'var(--clr-primary-dark)', padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
          {managers.length} managers
        </span>
      </div>

      <div className="card-modern-body">
        <div className="row g-4">
          {/* Left: Form */}
          <div className="col-md-4">
            <div className="section-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {editingId ? (
                <>
                  <span><i className="bi bi-pencil-square me-1"></i> Edit Manager</span>
                  <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--clr-text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                    <i className="bi bi-x-circle me-1"></i> Cancel
                  </button>
                </>
              ) : <span>Hire New Manager</span>}
            </div>

            {editingId && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#1e40af' }}>
                <i className="bi bi-info-circle me-1"></i> Editing <strong>{editingId}</strong> — only name, email, and phone can be modified.
              </div>
            )}

            {message && (
              <div className={`alert alert-${message.type} mb-3`}>
                <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-modern">
              <div className="mb-3">
                <label>Full Name</label>
                <input type="text" name="name" className="form-control" placeholder="Manager's full name"
                  required pattern={NAME_PATTERN} title={NAME_MSG}
                  value={formData.name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input type="email" name="email" className="form-control" placeholder="manager@uohyd.ac.in"
                  required pattern={EMAIL_PATTERN} title={EMAIL_MSG}
                  value={formData.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label>Phone Number</label>
                <input type="tel" name="phone" className="form-control" placeholder="10-digit number"
                  required pattern={PHONE_PATTERN} title={PHONE_MSG}
                  value={formData.phone} onChange={handleChange} />
              </div>

              {!editingId && (
                <>
                  <div className="mb-3">
                    <label>Assign to Building</label>
                    <select name="locationId" className="form-control" required value={formData.locationId} onChange={handleChange}>
                      <option value="">— Select Building —</option>
                      {locations.map((loc) => {
                        const taken = assignedLocIds.includes(loc.locationId);
                        return (
                          <option key={loc.locationId} value={loc.locationId} disabled={taken}>
                            {loc.buildingName}{taken ? ' (already assigned)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label>Temporary Password</label>
                    <input type="password" name="password" className="form-control" placeholder="Set initial password"
                      required pattern={PASSWORD_PATTERN} title={PASSWORD_MSG}
                      value={formData.password} onChange={handleChange} />
                    <small style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                      Manager should change this on first login.
                    </small>
                  </div>
                </>
              )}

              <button type="submit" className={editingId ? 'btn-success-modern' : 'btn-grad'}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>{editingId ? 'Updating…' : 'Creating…'}</>
                  : editingId
                    ? <><i className="bi bi-check-circle me-2"></i>Save Changes</>
                    : <><i className="bi bi-person-plus me-2"></i>Create Account</>
                }
              </button>
            </form>
          </div>

          {/* Right: Table */}
          <div className="col-md-8">
            <div className="section-heading">Active Managers</div>
            <div style={{ overflowY: 'auto', maxHeight: '460px' }}>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Manager ID</th>
                    <th>Name &amp; Email</th>
                    <th>Assigned Building</th>
                    <th>Phone</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '2rem' }}>
                      <i className="bi bi-people" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}></i> No managers found.
                    </td></tr>
                  ) : managers.map((mgr) => (
                    <tr key={mgr.userId} style={{ cursor: 'default', background: editingId === mgr.userId ? '#eff6ff' : undefined }}>
                      <td><span className="complaint-id">{mgr.userId}</span></td>
                      <td>
                        <strong>{mgr.name}</strong><br />
                        <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>{mgr.email}</span>
                      </td>
                      <td>
                        {mgr.assignedLocation?.buildingName
                          ? <span className="badge-status badge-accepted"><i className="bi bi-building"></i> {mgr.assignedLocation.buildingName}</span>
                          : <span className="badge-status badge-pending"><i className="bi bi-exclamation-circle"></i> Unassigned</span>
                        }
                      </td>
                      <td style={{ color: 'var(--clr-text-2)', fontSize: '0.875rem' }}>{mgr.phone}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => handleEdit(mgr)} title="Edit manager details"
                          style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
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