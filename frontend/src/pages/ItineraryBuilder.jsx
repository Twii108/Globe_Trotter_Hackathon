import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle, 
  Eye,
  Building2,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { getTrip, addStop, addActivity, removeActivity, deleteStop, reorderStops, updateTrip } from '../services/api';
import '../styles/dashboard.css';

export default function ItineraryBuilder({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Stop Modal State
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [newStopData, setNewStopData] = useState({ city: '', startDate: '', endDate: '' });
  const [submittingStop, setSubmittingStop] = useState(false);

  // Add Activity Modal State
  const [addActivityStopId, setAddActivityStopId] = useState(null);
  const [newActivityData, setNewActivityData] = useState({ name: '', time: '10:00 AM', cost: '20', dayNumber: '1', date: '' });
  const [submittingActivity, setSubmittingActivity] = useState(false);

  useEffect(() => {
    loadTripData();
  }, [id]);

  const loadTripData = async () => {
    setLoading(true);
    try {
      const data = await getTrip(id);
      setTrip(data);
    } catch (err) {
      console.error('Error loading trip for builder:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- STOP ACTIONS ---
  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    if (!newStopData.city.trim()) {
      alert('Please enter a city name.');
      return;
    }

    setSubmittingStop(true);
    try {
      const res = await addStop(id, {
        city: newStopData.city,
        startDate: newStopData.startDate || trip.startDate,
        endDate: newStopData.endDate || trip.endDate
      });
      setTrip(res.trip);
      setNewStopData({ city: '', startDate: '', endDate: '' });
      setIsAddStopOpen(false);
    } catch (err) {
      alert('Failed to add stop.');
    } finally {
      setSubmittingStop(false);
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Remove this destination stop and its activities?')) return;
    const updated = await deleteStop(id, stopId);
    if (updated) setTrip(updated);
  };

  const handleMoveStop = async (index, direction) => {
    if (!trip || !trip.stops) return;
    const newStops = [...trip.stops];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    // Swap stops
    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    setTrip({ ...trip, stops: newStops });
    await reorderStops(id, newStops);
  };

  // --- ACTIVITY ACTIONS ---
  const handleOpenAddActivity = (stop) => {
    setAddActivityStopId(stop.id);
    setNewActivityData({
      name: '',
      time: '10:00 AM',
      cost: '25',
      dayNumber: '1',
      date: stop.startDate || trip.startDate
    });
  };

  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    if (!newActivityData.name.trim()) {
      alert('Please enter an activity name.');
      return;
    }

    setSubmittingActivity(true);
    try {
      const res = await addActivity(id, addActivityStopId, {
        name: newActivityData.name,
        time: newActivityData.time,
        cost: newActivityData.cost,
        dayNumber: newActivityData.dayNumber,
        date: newActivityData.date
      });
      setTrip(res.trip);
      setAddActivityStopId(null);
    } catch (err) {
      alert('Failed to add activity.');
    } finally {
      setSubmittingActivity(false);
    }
  };

  const handleRemoveActivity = async (stopId, activityId) => {
    const updated = await removeActivity(id, stopId, activityId);
    if (updated) setTrip(updated);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar user={user} onLogout={onLogout} />
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Itinerary Builder...
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="dashboard-page">
        <Navbar user={user} onLogout={onLogout} />
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <h2>Trip Not Found</h2>
          <Button variant="primary" onClick={() => navigate('/trips')}>
            Back to My Trips
          </Button>
        </div>
      </div>
    );
  }

  const stops = trip.stops || [];

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content" style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Top Actions Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate('/trips')}
              >
                Back to My Trips
              </Button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ Itinerary Builder</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="secondary"
                size="md"
                icon={<Plus size={18} />}
                onClick={() => setIsAddStopOpen(true)}
              >
                Add Stop
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<Eye size={18} />}
                onClick={() => navigate(`/trips/${id}`)}
              >
                View Itinerary
              </Button>
            </div>
          </div>

          {/* Trip Banner Overview */}
          <div
            className="card"
            style={{
              padding: '1.5rem 2rem',
              marginBottom: '2rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '3px 10px', borderRadius: '12px' }}>
                Itinerary Builder Mode
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.5rem 0 0.25rem 0' }}>
                {trip.name || trip.destination}
              </h1>
              <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} /> {trip.startDate} to {trip.endDate} ({trip.durationDays} Days)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={15} color="var(--primary)" /> {stops.length} Destination {stops.length === 1 ? 'Stop' : 'Stops'}
                </span>
              </div>
            </div>
          </div>

          {/* STOPS LIST SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 color="var(--primary)" size={22} />
                Itinerary Destination Stops ({stops.length})
              </h2>
            </div>

            {stops.length === 0 ? (
              <div
                style={{
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--surface)',
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <MapPin size={40} color="var(--primary)" style={{ opacity: 0.6, marginBottom: '0.75rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>No Destination Stops Added Yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Add your first city stop to begin structuring your day-by-day activities.
                </p>
                <Button
                  variant="primary"
                  icon={<Plus size={18} />}
                  onClick={() => setIsAddStopOpen(true)}
                >
                  Add First Stop
                </Button>
              </div>
            ) : (
              stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Stop Header Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem'
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {stop.city}
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                          <Calendar size={13} /> {stop.startDate} – {stop.endDate}
                        </span>
                      </div>
                    </div>

                    {/* Reorder and Delete controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={index === 0}
                        icon={<ArrowUp size={14} />}
                        onClick={() => handleMoveStop(index, -1)}
                        title="Move Stop Up"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={index === stops.length - 1}
                        icon={<ArrowDown size={14} />}
                        onClick={() => handleMoveStop(index, 1)}
                        title="Move Stop Down"
                      />
                      <Button
                        variant="text"
                        size="sm"
                        style={{ color: 'var(--danger)' }}
                        icon={<Trash2 size={16} />}
                        onClick={() => handleDeleteStop(stop.id)}
                        title="Remove Stop"
                      >
                        Remove Stop
                      </Button>
                    </div>
                  </div>

                  {/* Activities under this stop */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Planned Activities ({stop.activities ? stop.activities.length : 0})
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Plus size={14} />}
                        onClick={() => handleOpenAddActivity(stop)}
                      >
                        Add Activity
                      </Button>
                    </div>

                    {stop.activities && stop.activities.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {stop.activities.map((act) => (
                          <div
                            key={act.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1rem',
                              backgroundColor: 'var(--neutral-bg)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <CheckCircle size={16} color="var(--primary)" />
                              <div>
                                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                  {act.name}
                                </span>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} /> {act.time}
                                  </span>
                                  {act.cost !== undefined && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)', fontWeight: 600 }}>
                                      <DollarSign size={12} /> Est. ${act.cost}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveActivity(stop.id, act.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px'
                              }}
                              title="Remove Activity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)' }}>
                        No activities added to {stop.city} yet. Click "+ Add Activity" above.
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal: Add Stop */}
      <Modal
        isOpen={isAddStopOpen}
        onClose={() => setIsAddStopOpen(false)}
        title="Add Destination Stop"
        maxWidth="500px"
      >
        <form onSubmit={handleAddStopSubmit}>
          <Input
            label="City Name"
            value={newStopData.city}
            onChange={(e) => setNewStopData({ ...newStopData, city: e.target.value })}
            placeholder="e.g. Kyoto"
            icon={<MapPin size={16} />}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Start Date"
              type="date"
              value={newStopData.startDate}
              onChange={(e) => setNewStopData({ ...newStopData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={newStopData.endDate}
              onChange={(e) => setNewStopData({ ...newStopData, endDate: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsAddStopOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingStop}>
              Add Stop
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Activity */}
      <Modal
        isOpen={Boolean(addActivityStopId)}
        onClose={() => setAddActivityStopId(null)}
        title="Add Activity to Stop"
        maxWidth="500px"
      >
        <form onSubmit={handleAddActivitySubmit}>
          <Input
            label="Activity Name"
            value={newActivityData.name}
            onChange={(e) => setNewActivityData({ ...newActivityData, name: e.target.value })}
            placeholder="e.g. Guided Walking Tour & Local Lunch"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Time"
              value={newActivityData.time}
              onChange={(e) => setNewActivityData({ ...newActivityData, time: e.target.value })}
              placeholder="e.g. 10:00 AM"
            />
            <Input
              label="Estimated Cost ($)"
              type="number"
              value={newActivityData.cost}
              onChange={(e) => setNewActivityData({ ...newActivityData, cost: e.target.value })}
              placeholder="e.g. 30"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setAddActivityStopId(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingActivity}>
              Add Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
