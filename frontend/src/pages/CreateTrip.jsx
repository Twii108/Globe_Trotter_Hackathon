import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { createTrip } from '../services/api';
import { Compass, Calendar, DollarSign, Image as ImageIcon, FileText, AlertTriangle } from 'lucide-react';
import '../styles/dashboard.css';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    budget: '2500',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
  });

  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Validation Rules
    if (!formData.name.trim()) {
      setValidationError('Trip Name is required.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setValidationError('Start date and End date are required.');
      return;
    }
    if (formData.endDate < formData.startDate) {
      setValidationError('End date cannot be earlier than Start date.');
      return;
    }
    if (Number(formData.budget) < 0) {
      setValidationError('Target budget cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      const newTrip = await createTrip({
        name: formData.name.trim(),
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(formData.budget) || 0,
        coverImage: formData.coverImage
      });

      // Navigate directly to Itinerary Builder
      navigate(`/trips/${newTrip.id}`);
    } catch (err) {
      setValidationError(err.message || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="dashboard" />

      <main className="dashboard-content" style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={24} color="var(--primary)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Create New Adventure
              </h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Set your destination, dates, and budget target to start building your itinerary.
              </p>
            </div>
          </div>

          {validationError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <AlertTriangle size={18} /> {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Trip Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Autumn in Kyoto & Tokyo"
              required
            />

            <div className="input-group">
              <label className="input-label">Description & Notes</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your travel goals, highlights, or group details..."
                className="input-field"
                rows={3}
                style={{ fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Start Date *"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              <Input
                label="End Date *"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Target Budget ($) *"
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g. 2500"
              required
            />

            <Input
              label="Cover Image URL (Optional)"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                Save & Build Itinerary
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
