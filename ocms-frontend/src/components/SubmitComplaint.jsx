import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const SubmitComplaint = () => {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', locationId: '' });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations/all');
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations', error);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setImage(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('locationId', formData.locationId);
    if (image) submitData.append('image', image);

    try {
      const response = await api.post('/complaints/submit', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(response.data);
      setIsError(false);
      setFormData({ title: '', description: '', locationId: '' });
      setImage(null);
      const inp = document.getElementById('imageInput');
      if (inp) inp.value = '';
    } catch (error) {
      setMessage(error.response?.data || 'An error occurred.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-modern fade-in-up">
      <div className="card-modern-header gradient">
        <h5><i className="bi bi-send-plus"></i> Register a New Complaint</h5>
      </div>
      <div className="card-modern-body">
        {message && (
          <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} mb-4`} role="alert">
            <i className={`bi ${isError ? 'bi-exclamation-circle' : 'bi-check-circle-fill'} me-2`}></i>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-modern">
          <div className="row g-3 mb-1">
            <div className="col-md-7">
              <label htmlFor="title">Complaint Title</label>
              <input
                id="title"
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g., Broken fan in Room 204"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-5">
              <label htmlFor="locationId">Building / Location</label>
              <select
                id="locationId"
                name="locationId"
                className="form-control"
                required
                value={formData.locationId}
                onChange={handleChange}
              >
                <option value="">— Select a building —</option>
                {locations.map((loc) => (
                  <option key={loc.locationId} value={loc.locationId}>
                    {loc.buildingName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3 mt-2">
            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="4"
              required
              placeholder="Add detailed location and description of the complaint (room number, floor, exact spot, nature of issue)…"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Drag-drop upload area */}
          <div className="mb-4">
            <label>Photo Evidence <span style={{ color: 'var(--clr-text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragOver ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                background: dragOver ? 'var(--clr-primary-light)' : '#fafafa',
                transition: 'var(--transition)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('imageInput').click()}
            >
              {image ? (
                <div style={{ color: 'var(--clr-primary)', fontWeight: 500 }}>
                  <i className="bi bi-image me-2"></i>{image.name}
                  <span
                    role="button"
                    style={{ marginLeft: '1rem', color: 'var(--clr-rejected)', fontSize: '0.85rem', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  >
                    ✕ Remove
                  </span>
                </div>
              ) : (
                <div style={{ color: 'var(--clr-text-muted)' }}>
                  <i className="bi bi-cloud-upload" style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.4rem' }}></i>
                  <span style={{ fontSize: '0.875rem' }}>Drag & drop an image here, or <strong>click to browse</strong></span>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-grad"
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Submitting…</>
            ) : (
              <><i className="bi bi-send me-2"></i>Submit Complaint</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;