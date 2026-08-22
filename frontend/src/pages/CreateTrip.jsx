import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Calendar, FileText, Image as ImageIcon, MapPin, Plus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { createTrip } from '../services/api';
import '../styles/dashboard.css';

const PRESET_COVERS = [
  { name: 'Japan', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Italy', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80' },
  { name: 'Greece', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80' },
  { name: 'Swiss Alps', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80' },
  { name: 'Paris', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' }
];

export default function CreateTrip({ user, onLogout }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    coverImage: PRESET_COVERS[0].url,
    budget: '2500',
    tags: 'Vacation, Culture'
  });

  const [customImageUrl, setCustomImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Trip name is required.';
    if (!formData.startDate) errs.startDate = 'Start date is required.';
    if (!formData.endDate) errs.endDate = 'End date is required.';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errs.endDate = 'End date cannot be earlier than start date.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const finalCover = customImageUrl.trim() || formData.coverImage;
      const created = await createTrip({
        name: formData.name,
        destination: formData.destination || formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        coverImage: finalCover,
        budget: formData.budget,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : ['Vacation']
      });

      // Navigate to Itinerary Builder for the created trip
      navigate(`/trips/${created.id}/builder`);
    } catch (err) {
      console.error('Error creating trip:', err);
      alert('Failed to save trip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content" style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          {/* Top navigation back header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/trips')}
            >
              Back to My Trips
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ Create New Trip</span>
          </div>

          {/* Form Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass color="var(--primary)" size={28} />
                Plan a New Trip
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Set your dates, destination details, and cover photo to launch your custom itinerary.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Trip Name & Destination */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <Input
                  label="Trip Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Summer in Tokyo & Kyoto"
                  icon={<Compass size={16} />}
                  error={errors.name}
                  required
                />
                <Input
                  label="Primary Destination / Country"
                  name="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g. Japan"
                  icon={<MapPin size={16} />}
                />
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <Input
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  icon={<Calendar size={16} />}
                  error={errors.startDate}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  icon={<Calendar size={16} />}
                  error={errors.endDate}
                  required
                />
              </div>

              {/* Description */}
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={16} /> Trip Description
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What are your goals or highlights for this trip? (e.g., Visiting historical shrines, tasting ramen, coastal drives)"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Cover Image Selector */}
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ImageIcon size={16} /> Select Cover Photo
                </label>

                {/* Preset Thumbnails */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {PRESET_COVERS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setFormData({ ...formData, coverImage: preset.url });
                        setCustomImageUrl('');
                      }}
                      style={{
                        position: 'relative',
                        height: '60px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: formData.coverImage === preset.url && !customImageUrl ? '3px solid var(--primary)' : '1px solid var(--border)',
                        boxShadow: formData.coverImage === preset.url && !customImageUrl ? '0 0 0 2px rgba(15,76,129,0.3)' : 'none'
                      }}
                    >
                      <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {formData.coverImage === preset.url && !customImageUrl && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,76,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={20} color="#fff" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom URL Input */}
                <Input
                  label="Or enter custom Image URL"
                  name="customImageUrl"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Selected Image Preview */}
              <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '140px', border: '1px solid var(--border)', position: 'relative' }}>
                <img
                  src={customImageUrl.trim() || formData.coverImage}
                  alt="Cover Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(15,23,42,0.7)', color: '#fff', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
                  Cover Image Preview
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/trips')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  icon={<Plus size={18} />}
                >
                  Save & Build Itinerary
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
