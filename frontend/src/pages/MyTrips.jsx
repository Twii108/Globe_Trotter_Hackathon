import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Compass, Search, Filter, FolderX, RefreshCw, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import TripCard from '../components/TripCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { getTrips, deleteTrip, tripService } from '../services/api';
import '../styles/dashboard.css';

export default function MyTrips({ user, onLogout }) {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteTrip(deleteTargetId);
      setTrips(prev => prev.filter(t => String(t.id) !== String(deleteTargetId)));
      setDeleteTargetId(null);
    } catch (err) {
      alert('Failed to delete trip.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const tripName = (trip.name || trip.destination || '').toLowerCase();
    const country = (trip.country || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = tripName.includes(query) || country.includes(query);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && (trip.status || '').toUpperCase() === statusFilter.toUpperCase();
  });

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content" style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container">
          {/* Header & Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Compass size={30} color="var(--primary)" />
                My Trips
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                Manage all your upcoming and past itineraries in one place.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={<Plus size={18} />}
              onClick={() => navigate('/trips/create')}
            >
              Create New Trip
            </Button>
          </div>

          {/* Search & Filter controls */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '1.75rem',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search trip name, destination, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
                style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="PLANNING">Planning</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Trips Grid */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your trips...
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="trips-grid">
              {filteredTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={(id) => setDeleteTargetId(id)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="empty-state">
              <div className="empty-state-icon">
                <FolderX size={32} />
              </div>
              <h3 className="empty-state-title">No Trips Found</h3>
              <p className="empty-state-text">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No trips match your current search or status filter.'
                  : 'You have not created any trips yet. Click below to start planning!'}
              </p>
              <Button
                variant="primary"
                icon={<Plus size={18} />}
                onClick={() => navigate('/trips/create')}
              >
                Create Your First Trip
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Confirm Delete Trip"
        maxWidth="440px"
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ padding: '0.5rem', background: '#FEE2E2', borderRadius: '50%', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1rem' }}>Delete this trip itinerary?</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Are you sure you want to delete this trip? This action cannot be undone and will delete all associated stops and activities.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button
            variant="outline"
            onClick={() => setDeleteTargetId(null)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
            loading={isDeleting}
            onClick={handleDeleteConfirm}
          >
            Delete Trip
          </Button>
        </div>
      </Modal>
    </div>
  );
}
