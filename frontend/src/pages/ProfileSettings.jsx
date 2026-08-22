import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { authService, getSavedCities, toggleSaveCity, getTrips, addStop } from '../services/api';
import { User, Mail, DollarSign, Image as ImageIcon, Heart, Trash2, Plus, LogOut, ShieldAlert, Compass } from 'lucide-react';
import Modal from '../components/Modal';
import '../styles/dashboard.css';

export default function ProfileSettings() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    email: '',
    avatar: '',
    preferredCurrency: 'USD',
    travelStyle: 'Balanced Explorer'
  });

  const [savedCities, setSavedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add saved city to trip modal
  const [selectedCity, setSelectedCity] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const usr = await authService.getCurrentUser();
      if (usr) {
        setUser({
          name: usr.name || '',
          email: usr.email || '',
          avatar: usr.avatar || '',
          preferredCurrency: usr.preferredCurrency || 'USD',
          travelStyle: usr.travelStyle || 'Balanced Explorer'
        });
      }

      const cities = await getSavedCities();
      setSavedCities(cities);

      const trips = await getTrips();
      setUserTrips(trips);
      if (trips.length > 0) setSelectedTripId(trips[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      const updated = await authService.updateProfile({
        name: user.name,
        avatar: user.avatar,
        preferredCurrency: user.preferredCurrency,
        travelStyle: user.travelStyle
      });
      setSuccessMessage('Profile and preferences updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnsaveCity = async (cityId) => {
    await toggleSaveCity(cityId);
    setSavedCities(savedCities.filter(c => String(c.id) !== String(cityId)));
  };

  const handleOpenAddModal = (city) => {
    setSelectedCity(city);
    setIsAddModalOpen(true);
  };

  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTripId) return;
    try {
      await addStop(selectedTripId, {
        city: selectedCity.name,
        cityId: selectedCity.id
      });
      alert(`Added ${selectedCity.name} to trip!`);
      setIsAddModalOpen(false);
    } catch (err) {
      alert('Failed to add stop.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('CRITICAL WARNING: Are you sure you want to permanently delete your account and all itineraries? This action cannot be undone.')) {
      await authService.deleteAccount();
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="profile" />

      <main className="dashboard-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Profile & Account Settings
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Manage personal details, travel preferences, currency defaults, and saved destinations.
            </p>
          </div>

          <Button variant="outline" size="sm" icon={<LogOut size={16} />} onClick={handleLogout}>
            Log Out
          </Button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', color: '#10b981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Profile Settings Form */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--primary)" /> Profile Information
          </h2>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Full Name *"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                value={user.email}
                disabled
                placeholder="ReadOnly Email"
              />
            </div>

            <Input
              label="Avatar Image URL"
              value={user.avatar}
              onChange={(e) => setUser({ ...user, avatar: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Preferred Currency</label>
                <select
                  className="input-field"
                  value={user.preferredCurrency}
                  onChange={(e) => setUser({ ...user, preferredCurrency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Travel Style</label>
                <select
                  className="input-field"
                  value={user.travelStyle}
                  onChange={(e) => setUser({ ...user, travelStyle: e.target.value })}
                >
                  <option value="Balanced Explorer">Balanced Explorer</option>
                  <option value="Budget Traveler">Budget Traveler</option>
                  <option value="Luxury & Comfort">Luxury & Comfort</option>
                  <option value="Culture & Heritage">Culture & Heritage</option>
                  <option value="Fast-Paced Adventure">Fast-Paced Adventure</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="submit" variant="primary" loading={saving}>
                Save Preferences
              </Button>
            </div>
          </form>
        </div>

        {/* SAVED DESTINATIONS GALLERY (#19 in prompt) */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} color="#ef4444" fill="#ef4444" /> Saved Destinations ({savedCities.length})
          </h2>

          {savedCities.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {savedCities.map(city => (
                <div key={city.id} style={{ padding: '1rem', background: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{city.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📍 {city.country} ({city.region})</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <Button variant="outline" size="sm" icon={<Plus size={13} />} onClick={() => handleOpenAddModal(city)}>
                      Add to Trip
                    </Button>

                    <button
                      onClick={() => handleUnsaveCity(city.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                      title="Unsave City"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No saved destinations yet. Browse the City Discovery screen and click the heart icon to save favorite cities.
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--danger)' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--danger)', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={18} /> Danger Zone
          </h3>
          <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Permanently delete your account, all custom trip itineraries, and profile preferences.
          </p>
          <Button variant="outline" size="sm" onClick={handleDeleteAccount} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            Delete Account
          </Button>
        </div>

        {/* Add to Trip Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={`Add ${selectedCity?.name} to Trip`}>
          <form onSubmit={handleAddStopSubmit}>
            <div className="input-group">
              <label className="input-label">Select Trip</label>
              <select
                className="input-field"
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                required
              >
                {userTrips.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.startDate})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Add Stop</Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
