import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { Search, Clock, DollarSign, Plus, Filter, Tag, Compass, ArrowUpDown } from 'lucide-react';
import { getActivities, getTrips, addActivity } from '../services/api';
import '../styles/dashboard.css';

const CATEGORIES = ['All', 'Sightseeing', 'Food', 'Culture', 'Adventure', 'Nature', 'Entertainment', 'Shopping'];

export default function ActivitySearch() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxCostFilter, setMaxCostFilter] = useState('1000');
  const [sortBy, setSortBy] = useState('price_low'); // 'price_low' | 'price_high' | 'duration'

  // Add Activity Modal
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadActivities();
    loadUserTrips();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await getActivities({});
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTrips = async () => {
    try {
      const trips = await getTrips();
      setUserTrips(trips);
      if (trips.length > 0) {
        setSelectedTripId(trips[0].id);
        if (trips[0].stops && trips[0].stops.length > 0) {
          setSelectedStopId(trips[0].stops[0].id);
        }
      }
    } catch (err) { }
  };

  const handleOpenAddModal = (act) => {
    setSelectedActivity(act);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTripId || !selectedStopId) {
      toast.error('Please select a trip and destination stop.');
      return;
    }
    setSubmitting(true);
    try {
      await addActivity(selectedTripId, selectedStopId, {
        activityId: selectedActivity.id,
        name: selectedActivity.name,
        category: selectedActivity.category,
        date: scheduledDate,
        time: scheduledTime,
        cost: selectedActivity.cost
      });
      toast.success(`Added "${selectedActivity.name}" to trip itinerary!`);
      setIsAddModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add activity.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredActivities = activities.filter(a => {
    const matchesSearch = searchQuery === '' ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || a.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesCost = a.cost <= Number(maxCostFilter);

    return matchesSearch && matchesCategory && matchesCost;
  }).sort((a, b) => {
    if (sortBy === 'price_high') return b.cost - a.cost;
    if (sortBy === 'duration') return b.duration - a.duration;
    return a.cost - b.cost; // price low default
  });

  const activeTripObj = userTrips.find(t => String(t.id) === String(selectedTripId));

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="activities" />

      <main className="dashboard-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Activity & Experience Catalog
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Discover tours, museum passes, street food walks, and thrill activities across your favorite destination cities.
          </p>
        </div>

        {/* Category Filter Pills (#8 in prompt) */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--surface)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: selectedCategory === cat ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Toolbar */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ flex: '1 1 300px' }}>
            <Input
              icon={<Search size={18} />}
              placeholder="Search activities by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <DollarSign size={15} /> Max Cost:
              <select
                value={maxCostFilter}
                onChange={(e) => setMaxCostFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <option value="1000">Any Cost</option>
                <option value="0">Free Only</option>
                <option value="30">Under $30</option>
                <option value="100">Under $100</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <ArrowUpDown size={15} /> Sort:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Cards Grid */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading activity catalog...</div>
        ) : filteredActivities.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '3px 10px', borderRadius: '12px' }}>
                      {act.category || 'Sightseeing'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      📍 {act.cityName || 'City'}
                    </span>
                  </div>

                  <h3 style={{ margin: '0.2rem 0 0.3rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {act.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {act.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', padding: '0.6rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                    <span>Duration: <strong>{act.duration || 1.5}h</strong></span>
                    <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.95rem' }}>
                      {act.cost === 0 ? 'FREE' : `$${act.cost}`}
                    </span>
                  </div>
                </div>

                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => handleOpenAddModal(act)}>
                  Add Activity
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No activities found matching your filter criteria.
          </div>
        )}

        {/* Add Activity Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={`Add "${selectedActivity?.name}" to Trip`}>
          <form onSubmit={handleAddSubmit}>
            <div className="input-group">
              <label className="input-label">Select Trip *</label>
              <select
                className="input-field"
                value={selectedTripId}
                onChange={(e) => {
                  setSelectedTripId(e.target.value);
                  const t = userTrips.find(trip => String(trip.id) === String(e.target.value));
                  if (t && t.stops && t.stops.length > 0) setSelectedStopId(t.stops[0].id);
                }}
                required
              >
                {userTrips.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.startDate})</option>
                ))}
              </select>
            </div>

            {activeTripObj && activeTripObj.stops && activeTripObj.stops.length > 0 && (
              <div className="input-group">
                <label className="input-label">Select City Stop *</label>
                <select
                  className="input-field"
                  value={selectedStopId}
                  onChange={(e) => setSelectedStopId(e.target.value)}
                  required
                >
                  {activeTripObj.stops.map(s => (
                    <option key={s.id} value={s.id}>{s.city} ({s.startDate} ➔ {s.endDate})</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Scheduled Date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} required />
              <Input label="Scheduled Time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} placeholder="e.g. 10:00 AM" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={submitting}>Add Activity</Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
