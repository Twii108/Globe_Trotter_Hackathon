import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { Search, Plus, Compass, Calendar, DollarSign, Eye, Edit, Trash2, Copy, Filter, ArrowUpDown } from 'lucide-react';
import { getTrips, deleteTrip, duplicateTrip } from '../services/api';
import '../styles/dashboard.css';

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'date' | 'budget_high' | 'budget_low'

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip?')) {
      await deleteTrip(id);
      setTrips(trips.filter(t => String(t.id) !== String(id)));
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    const cloned = await duplicateTrip(id);
    setTrips([cloned, ...trips]);
  };

  // Filter & Sort Logic
  const filteredTrips = trips.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(a.startDate) - new Date(b.startDate);
    if (sortBy === 'budget_high') return b.budget - a.budget;
    if (sortBy === 'budget_low') return a.budget - b.budget;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // newest default
  });

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="my-trips" />

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              My Trips & Itineraries
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Manage, search, sort, and duplicate all your travel itineraries in one place.
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => navigate('/trips/create')}
          >
            Create New Trip
          </Button>
        </div>

        {/* Filter & Search Toolbar */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ flex: '1 1 300px', minWidth: '260px' }}>
            <Input
              icon={<Search size={18} />}
              placeholder="Search trips by name, destination, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <Filter size={16} /> Status:
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Planning">Planning</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <ArrowUpDown size={16} /> Sort:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <option value="newest">Newest First</option>
                <option value="date">Start Date</option>
                <option value="budget_high">Highest Budget</option>
                <option value="budget_low">Lowest Budget</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trip Grid */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading your trips...
          </div>
        ) : filteredTrips.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredTrips.map((trip) => {
              const cityCount = trip.stops ? trip.stops.length : 0;
              const actCount = (trip.stops || []).reduce((sum, s) => sum + (s.activities ? s.activities.length : 0), 0);

              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                      alt={trip.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.95)', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                      {trip.status}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {trip.name}
                    </h3>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <Calendar size={14} /> {trip.startDate} ➔ {trip.endDate}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-main)', padding: '0.6rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                      <span>📍 <strong>{cityCount}</strong> Cities</span>
                      <span>🎯 <strong>{actCount}</strong> Activities</span>
                      <span>💵 <strong>${trip.budget}</strong></span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button variant="outline" size="sm" icon={<Eye size={14} />} onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}/view`); }}>
                        View
                      </Button>
                      <Button variant="primary" size="sm" icon={<Edit size={14} />} onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}>
                        Edit
                      </Button>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={(e) => handleDuplicate(trip.id, e)} title="Duplicate Trip" style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}>
                          <Copy size={15} />
                        </button>
                        <button onClick={(e) => handleDelete(trip.id, e)} title="Delete Trip" style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px', color: 'var(--danger)', cursor: 'pointer' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border)' }}>
            <Compass size={44} color="var(--primary)" style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>No trips found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              No travel itineraries match your current search query or filter criteria.
            </p>
            <Button variant="primary" onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}>Reset Filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}
