import React, { useState, useEffect } from 'react';
import { User, Mail, DollarSign, Compass, Bell, Check, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { authService } from '../services/api';
import '../styles/dashboard.css';

export default function ProfileSettings({ user, onLogout }) {
  const [profile, setProfile] = useState({
    name: user?.name || 'Alex Morgan',
    email: user?.email || 'alex.morgan@example.com',
    preferredCurrency: user?.preferredCurrency || 'USD',
    travelStyle: user?.travelStyle || 'Balanced Explorer',
    emailNotifications: true
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await authService.getCurrentUser();
    if (data) {
      setProfile(prev => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        preferredCurrency: data.preferredCurrency || prev.preferredCurrency,
        travelStyle: data.travelStyle || prev.travelStyle
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    try {
      await authService.updateProfile({
        name: profile.name,
        email: profile.email,
        preferredCurrency: profile.preferredCurrency,
        travelStyle: profile.travelStyle
      });
      setSuccessMsg('Profile settings updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content" style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <User color="var(--primary)" size={32} />
              Profile & Travel Preferences
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Update your profile information, preferred currency, and travel style settings.
            </p>
          </div>

          {/* Success Notification */}
          {successMsg && (
            <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={18} /> {successMsg}
            </div>
          )}

          {/* Form Card */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <form onSubmit={handleSubmit}>
              {/* Profile Avatar Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt="Avatar"
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {profile.name}
                  </h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {profile.email}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <Input
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  icon={<User size={16} />}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  icon={<Mail size={16} />}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DollarSign size={16} /> Preferred Currency
                  </label>
                  <select
                    value={profile.preferredCurrency}
                    onChange={(e) => setProfile({ ...profile, preferredCurrency: e.target.value })}
                    className="input-field"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Compass size={16} /> Travel Style
                  </label>
                  <select
                    value={profile.travelStyle}
                    onChange={(e) => setProfile({ ...profile, travelStyle: e.target.value })}
                    className="input-field"
                  >
                    <option value="Balanced Explorer">Balanced Explorer</option>
                    <option value="Budget Backpacker">Budget Backpacker</option>
                    <option value="Luxury Escapes">Luxury Escapes</option>
                    <option value="Cultural Heritage">Cultural Heritage</option>
                    <option value="Adventure Thrills">Adventure Thrills</option>
                  </select>
                </div>
              </div>

              {/* Notification Preference Toggle */}
              <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', margin: '1rem 0 1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Bell size={20} color="var(--primary)" />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>Email Itinerary Updates</span>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive email notifications when itinerary stops or schedule changes occur</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.emailNotifications}
                  onChange={(e) => setProfile({ ...profile, emailNotifications: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              {/* Submit Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <Button type="submit" variant="primary" loading={loading} icon={<Save size={18} />}>
                  Save Settings
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
