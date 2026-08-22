import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, Filter, Clock, DollarSign, Plus, Check, MapPin, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { searchActivities, getTrips, addActivity } from '../services/api';
import '../styles/dashboard.css';

const CATEGORIES = ['All', 'Sightseeing', 'Culture', 'Nature', 'Food', 'Adventure', 'Shopping'];

export default function ActivitySearch({ user, onLogout }) {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxCostFilter, setMaxCostFilter] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Activity Modal
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [scheduledDate, setScheduledDate] = useState('');
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory, maxCostFilter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const results = await searchActivities({
        category: selectedCategory,
        maxCost: maxCostFilter,
        searchQuery
      });
      setActivities(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  const handleOpenAddModal = async (act) => {
    setSelectedActivity(act);
    setSuccessMsg(null);
    try {
      const trips = await getTrips();
      setUserTrips(trips);
      if (trips.length > 0) {
        setSelectedTripId(String(trips[0].id));
        const firstStop = trips[0].stops && trips[0].stops.length > 0 ? trips[0].stops[0] : null;
        setSelectedStopId(firstStop ? String(firstStop.id) : '');
        setScheduledDate(firstStop ? firstStop.startDate : (trips[0].startDate || ''));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTripChange = (e) => {
    const tripId = e.target.value;
    setSelectedTripId(tripId);
    const trip = userTrips.find(t => String(t.id) === String(tripId));
    if (trip && trip.stops && trip.stops.length > 0) {
      setSelectedStopId(String(trip.stops[0].id));
      setScheduledDate(trip.stops[0].startDate);
    } else {
      setSelectedStopId('');
    }
  };

  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    if (!selectedTripId || !selectedActivity) return;
    setAdding(true);
    try {
      await addActivity(selectedTripId, selectedStopId, {
        name: selectedActivity.name,
        time: scheduledTime,
        cost: selectedActivity.estimatedCost || selectedActivity.cost || 0,
        date: scheduledDate
      });
      setSuccessMsg(`Added "${selectedActivity.name}" to your itinerary!`);
      setTimeout(() => {
        setSelectedActivity(null);
        navigate(`/trips/${selectedTripId}/builder`);
      }, 1200);
    } catch (err) {
      alert('Failed to attach activity to trip.');
    } finally {
      setAdding(false);
    }
  };

  const activeTrip = userTrips.find(t => String(t.id) === String(selectedTripId));
  const availableStops = activeTrip?.stops || [];

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content" style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Compass color="var(--primary)" size={32} />
              Activity Catalog & Discovery
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Find tours, cultural experiences, adventure activities, and gourmet food walks. Filter by category, budget, or duration.
            </p>
          </div>

          {/* Search & Filters */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search activity name or keywords (e.g., Museum, Hiking, Food)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              <Button type="submit" variant="primary" icon={<Search size={16} />}>
                Filter
              </Button>
            </form>

            {/* Category Pills & Cost Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Tag size={14} /> Category:
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--neutral-bg)',
                      color: selectedCategory === cat ? '#fff' : 'var(--text-main)',
                      transition: 'var(--transition)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Max Cost Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Max Cost:</span>
                <select
                  value={maxCostFilter}
                  onChange={(e) => setMaxCostFilter(e.target.value)}
                  className="input-field"
                  style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <option value="">Any Cost</option>
                  <option value="0">Free Only ($0)</option>
                  <option value="30">Under $30</option>
                  <option value="100">Under $100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Filtering activities...
            </div>
          ) : activities.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {activities.map((act) => (
                <div
                  key={act.id}
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
                      <span className="tag-badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                        {act.category || 'General'}
                      </span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>
                        {(act.estimatedCost || act.cost) > 0 ? `$${act.estimatedCost || act.cost}` : 'FREE'}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {act.name}
                    </h3>

                    {act.cityName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        <MapPin size={14} color="var(--primary)" />
                        <span>{act.cityName}</span>
                      </div>
                    )}

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {act.description}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} /> Est. {act.duration || 2} Hours
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    full
                    icon={<Plus size={16} />}
                    onClick={() => handleOpenAddModal(act)}
                  >
                    Add Activity
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Compass size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <h3 className="empty-state-title">No Activities Match Criteria</h3>
              <p className="empty-state-text">Try resetting filters to explore more activities.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Activity Modal */}
      <Modal
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        title={`Add "${selectedActivity?.name}" to Trip`}
        maxWidth="500px"
      >
        {successMsg ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--success)', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={32} />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleAddActivitySubmit}>
            {userTrips.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                No active trips. <Button variant="text" onClick={() => navigate('/trips/create')}>Create Trip First</Button>
              </div>
            ) : (
              <>
                <div className="input-group">
                  <label className="input-label">Select Trip</label>
                  <select
                    value={selectedTripId}
                    onChange={handleTripChange}
                    className="input-field"
                    required
                  >
                    {userTrips.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.destination}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Select Destination Stop</label>
                  <select
                    value={selectedStopId}
                    onChange={(e) => setSelectedStopId(e.target.value)}
                    className="input-field"
                    required
                  >
                    {availableStops.length > 0 ? (
                      availableStops.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.city} ({s.startDate})
                        </option>
                      ))
                    ) : (
                      <option value="">Main Trip (Default Stop)</option>
                    )}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Scheduled Time</label>
                    <input
                      type="text"
                      className="input-field"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Scheduled Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedActivity(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={adding} disabled={userTrips.length === 0}>
                Add Activity
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
