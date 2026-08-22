import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Globe, Star, TrendingUp, Plus, Check, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { searchCities, getTrips, addStop } from '../services/api';
import '../styles/dashboard.css';

export default function CitySearch({ user, onLogout }) {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add to Trip Modal State
  const [selectedCity, setSelectedCity] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [stopStartDate, setStopStartDate] = useState('');
  const [stopEndDate, setStopEndDate] = useState('');
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchCities('');
  }, []);

  const fetchCities = async (q) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchCities(q);
      setCities(results);
    } catch (err) {
      setError('Failed to load cities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCities(query);
  };

  const handleOpenAddModal = async (city) => {
    setSelectedCity(city);
    setSuccessMsg(null);
    try {
      const trips = await getTrips();
      setUserTrips(trips);
      if (trips.length > 0) {
        setSelectedTripId(String(trips[0].id));
        setStopStartDate(trips[0].startDate || '');
        setStopEndDate(trips[0].endDate || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTripId || !selectedCity) return;
    setAdding(true);
    try {
      await addStop(selectedTripId, {
        city: selectedCity.name,
        cityId: selectedCity.id,
        startDate: stopStartDate,
        endDate: stopEndDate
      });
      setSuccessMsg(`Successfully added ${selectedCity.name} to your trip!`);
      setTimeout(() => {
        setSelectedCity(null);
        navigate(`/trips/${selectedTripId}/builder`);
      }, 1200);
    } catch (err) {
      alert('Failed to add city stop to trip.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content" style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container">
          {/* Title Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Globe color="var(--primary)" size={32} />
              Explore & Search Cities
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Discover global destinations, compare cost indices, popularity ratings, and add cities to your trip itinerary.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                backgroundColor: 'var(--surface)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search city, country, or region (e.g. Paris, Japan, Europe)..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    fetchCities(e.target.value);
                  }}
                  className="input-field"
                  style={{ paddingLeft: '2.75rem', fontSize: '1rem' }}
                />
              </div>
              <Button type="submit" variant="primary" icon={<Search size={18} />}>
                Search
              </Button>
            </div>
          </form>

          {/* Error Banner */}
          {error && (
            <div style={{ padding: '1rem', background: '#FEE2E2', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          {/* Results Grid */}
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Searching world destinations...
            </div>
          ) : cities.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {cities.map((city) => (
                <div
                  key={city.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {city.name}
                      </h3>
                      <span className="tag-badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                        {city.region || 'Global'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      <MapPin size={15} color="var(--primary)" />
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{city.country}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {city.description}
                    </p>

                    {/* Stats pills: Cost Index & Popularity */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{ padding: '4px 10px', background: 'var(--neutral-bg)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Cost Index: <span style={{ color: 'var(--accent)' }}>{'$'.repeat(Math.min(3, Math.ceil((city.costIndex || 5) / 3)))} ({city.costIndex || 5}/10)</span>
                      </div>
                      <div style={{ padding: '4px 10px', background: 'rgba(245,158,11,0.1)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={13} fill="#D97706" /> {city.popularity || 85}% Score
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    full
                    icon={<Plus size={16} />}
                    onClick={() => handleOpenAddModal(city)}
                  >
                    Add to Trip
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="empty-state">
              <Globe size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <h3 className="empty-state-title">No Cities Found</h3>
              <p className="empty-state-text">No cities matched "{query}". Try searching another region or country.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add City to Trip Modal */}
      <Modal
        isOpen={Boolean(selectedCity)}
        onClose={() => setSelectedCity(null)}
        title={`Add ${selectedCity?.name} to Trip`}
        maxWidth="500px"
      >
        {successMsg ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--success)', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={32} />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleAddStopSubmit}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Select which trip itinerary you want to add <strong>{selectedCity?.name}, {selectedCity?.country}</strong> to:
            </p>

            {userTrips.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                You don't have any trips yet. <Button variant="text" onClick={() => navigate('/trips/create')}>Create Trip First</Button>
              </div>
            ) : (
              <div className="input-group">
                <label className="input-label">Select Target Trip</label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="input-field"
                  required
                >
                  {userTrips.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.destination} ({t.startDate} - {t.endDate})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Stop Start Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={stopStartDate}
                  onChange={(e) => setStopStartDate(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Stop End Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={stopEndDate}
                  onChange={(e) => setStopEndDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedCity(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={adding} disabled={userTrips.length === 0}>
                Add City Stop
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
