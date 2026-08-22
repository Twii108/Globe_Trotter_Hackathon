import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import TransportManager from '../components/TransportManager';
import TripCalendarView from '../components/TripCalendarView';
import {
  getTrip,
  addStop,
  deleteStop,
  reorderStops,
  addActivity,
  removeActivity,
  searchCities,
  getActivities,
  getTripBudget,
  getTripHealth,
  toggleShareStatus
} from '../services/api';
import TripHealthCard from '../components/TripHealthCard';
import TripMap from '../components/TripMap';
import {
  MapPin, Plus, Trash2, Calendar, Clock, DollarSign, ArrowUp, ArrowDown,
  AlertTriangle, ShieldCheck, Share2, Check, Copy, ExternalLink, Activity as ActivityIcon, Compass, Eye
} from 'lucide-react';
import '../styles/dashboard.css';

export default function ItineraryBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transportSegments, setTransportSegments] = useState([]);
  const [healthInfo, setHealthInfo] = useState(null);
  const [budgetInfo, setBudgetInfo] = useState(null);

  // Modals
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [activeStopForActivity, setActiveStopForActivity] = useState(null);

  // Form States
  const [stopForm, setStopForm] = useState({ city: '', cityId: null, startDate: '', endDate: '' });
  const [activityForm, setActivityForm] = useState({ name: '', category: 'Sightseeing', date: '', time: '10:00 AM', cost: '30' });
  const [availableCities, setAvailableCities] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [stopError, setStopError] = useState('');
  const [activityError, setActivityError] = useState('');

  // Sharing
  const [shareId, setShareId] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [warningsDismissed, setWarningsDismissed] = useState(false);

  useEffect(() => {
    loadTripData();
    loadCatalogData();
  }, [id]);

  const refreshHealthAndBudget = async () => {
    try {
      const [health, budget] = await Promise.all([
        getTripHealth(id),
        getTripBudget(id)
      ]);
      setHealthInfo(health);
      setBudgetInfo(budget);
    } catch (err) {
      console.error('Failed to refresh health/budget:', err);
    }
  };

  const loadTripData = async () => {
    setLoading(true);
    try {
      const data = await getTrip(id);
      setTrip(data);
      if (data.shareId) setShareId(data.shareId);

      // Pre-fill default dates for stop form
      if (data.startDate && data.endDate) {
        setStopForm(prev => ({ ...prev, startDate: data.startDate, endDate: data.endDate }));
      }
      
      await refreshHealthAndBudget();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogData = async () => {
    const cities = await searchCities('');
    setAvailableCities(cities);
    const acts = await getActivities({});
    setAvailableActivities(acts);
  };

  // --- STOP MANAGEMENT ---
  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    setStopError('');

    if (!stopForm.city.trim()) {
      setStopError('City name is required.');
      return;
    }

    // Stop Date Validation Rules (#5 in prompt)
    if (stopForm.startDate && stopForm.endDate) {
      if (stopForm.startDate < trip.startDate) {
        setStopError(`Stop start date cannot be before trip start date (${trip.startDate}).`);
        return;
      }
      if (stopForm.endDate > trip.endDate) {
        setStopError(`Stop end date cannot be after trip end date (${trip.endDate}).`);
        return;
      }
      if (stopForm.endDate < stopForm.startDate) {
        setStopError('Stop end date cannot be earlier than start date.');
        return;
      }
    }

    try {
      const res = await addStop(id, {
        city: stopForm.city.trim(),
        cityId: stopForm.cityId,
        startDate: stopForm.startDate,
        endDate: stopForm.endDate,
        position: trip.stops ? trip.stops.length : 0
      });
      setTrip(res.trip);
      setIsAddStopOpen(false);
      setStopForm({ city: '', cityId: null, startDate: trip.startDate, endDate: trip.endDate });
      refreshHealthAndBudget();
    } catch (err) {
      setStopError(err.message || 'Failed to add stop.');
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Delete this destination city stop and all its activities?')) {
      const updated = await deleteStop(id, stopId);
      setTrip(updated);
      refreshHealthAndBudget();
    }
  };

  const handleMoveStop = async (stopIdx, direction) => {
    if (!trip || !trip.stops) return;
    const newStops = [...trip.stops];
    const targetIdx = direction === 'up' ? stopIdx - 1 : stopIdx + 1;
    if (targetIdx < 0 || targetIdx >= newStops.length) return;

    const temp = newStops[stopIdx];
    newStops[stopIdx] = newStops[targetIdx];
    newStops[targetIdx] = temp;

    const updatedTrip = await reorderStops(id, newStops);
    setTrip(updatedTrip);
    refreshHealthAndBudget();
  };

  // --- ACTIVITY MANAGEMENT ---
  const handleOpenAddActivity = (stop) => {
    setActiveStopForActivity(stop);
    setActivityForm({
      name: '',
      category: 'Sightseeing',
      date: stop.startDate || trip.startDate,
      time: '10:00 AM',
      cost: '30'
    });
    setActivityError('');
    setIsAddActivityOpen(true);
  };

  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    setActivityError('');

    if (!activityForm.name.trim()) {
      setActivityError('Activity name is required.');
      return;
    }
    if (Number(activityForm.cost) < 0) {
      setActivityError('Activity cost cannot be negative.');
      return;
    }

    // Activity Date Validation Rules (#6 in prompt)
    if (activeStopForActivity) {
      if (activityForm.date && activeStopForActivity.startDate && activityForm.date < activeStopForActivity.startDate) {
        setActivityError(`Activity date must be within stop dates (${activeStopForActivity.startDate} ➔ ${activeStopForActivity.endDate}).`);
        return;
      }
      if (activityForm.date && activeStopForActivity.endDate && activityForm.date > activeStopForActivity.endDate) {
        setActivityError(`Activity date must be within stop dates (${activeStopForActivity.startDate} ➔ ${activeStopForActivity.endDate}).`);
        return;
      }
    }

    try {
      const res = await addActivity(id, activeStopForActivity.id, {
        name: activityForm.name.trim(),
        category: activityForm.category,
        date: activityForm.date,
        time: activityForm.time,
        cost: Number(activityForm.cost) || 0
      });
      setTrip(res.trip);
      setIsAddActivityOpen(false);
      refreshHealthAndBudget();
    } catch (err) {
      setActivityError(err.message || 'Failed to add activity.');
    }
  };

  const handleRemoveActivity = async (stopId, actId) => {
    const updated = await removeActivity(id, stopId, actId);
    setTrip(updated);
    refreshHealthAndBudget();
  };

  // --- PUBLIC SHARING ---
  const handleToggleShare = async () => {
    const res = await toggleShareStatus(id, !trip.isPublic);
    setTrip({ ...trip, isPublic: !trip.isPublic, shareId: res.shareId });
    setShareId(res.shareId);
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/shared/${shareId || trip?.shareId || id}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  if (loading || !trip) {
    return (
      <div className="dashboard-layout">
        <Navbar activeTab="my-trips" />
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Itinerary Builder...
        </div>
      </div>
    );
  }



  return (
    <div className="dashboard-layout">
      <Navbar activeTab="my-trips" />

      <main className="dashboard-content" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                {trip.status}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {trip.startDate} ➔ {trip.endDate} ({trip.durationDays} Days)
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {trip.name}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" icon={<Eye size={15} />} onClick={() => navigate(`/trips/${id}/view`)}>
              View Mode
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/trips/${id}/budget`)}>
              <DollarSign size={15} /> Budget (${budgetInfo ? budgetInfo.effectiveSpending : '...'})
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/trips/${id}/timeline`)}>
              <Clock size={15} /> Timeline
            </Button>
            <Button variant="secondary" size="sm" icon={<Share2 size={15} />} onClick={handleToggleShare}>
              {trip.isPublic ? 'Sharing Enabled' : 'Enable Sharing'}
            </Button>
          </div>
        </div>

        {/* Public Sharing Link Card (If enabled) */}
        {trip.isPublic && (
          <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid var(--primary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                🌐 Public Sharing Link Active
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Anyone with this link can view a read-only copy of this trip itinerary.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" size="sm" icon={shareCopied ? <Check size={14} /> : <Copy size={14} />} onClick={handleCopyShareLink}>
                {shareCopied ? 'Link Copied!' : 'Copy Link'}
              </Button>
              <Button variant="outline" size="sm" icon={<ExternalLink size={14} />} onClick={() => window.open(`/shared/${shareId || trip.shareId}`, '_blank')}>
                Open Public Page
              </Button>
            </div>
          </div>
        )}

        {/* Conflict & Warning Banner (#22 in prompt) */}
        {!warningsDismissed && healthInfo && (healthInfo.conflicts.length > 0 || healthInfo.deductions.length > 0) && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', position: 'relative' }}>
            <button 
              onClick={() => setWarningsDismissed(true)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 'bold' }}
            >
              ✕
            </button>
            <div style={{ fontWeight: 800, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <AlertTriangle size={18} /> Itinerary Warnings & Conflicts Detected ({healthInfo.conflicts.length})
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              Your trip plan has some alerts. Click <a href="#health-card" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>here to view the Health breakdown card</a>.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {healthInfo.conflicts.map((warn, wIdx) => (
                <li key={wIdx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Trip Health Score Widget (Phase 2) */}
        <div id="health-card">
          <TripHealthCard healthInfo={healthInfo} />
        </div>

        {/* Interactive Map (Phase 3) */}
        <TripMap trip={trip} />

        {/* Main Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={22} color="var(--primary)" /> Destination City Stops & Activities
          </h2>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsAddStopOpen(true)}>
            Add Destination Stop
          </Button>
        </div>

        {/* VISUAL CITY HIERARCHY (#4 in prompt): CITY 1 ↓ activities ➔ CITY 2 ↓ activities */}
        {trip.stops && trip.stops.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {trip.stops.map((stop, stopIdx) => (
              <div
                key={stop.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* City Stop Header Bar */}
                <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--neutral-bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {stopIdx + 1}
                    </span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {stop.city}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Dates: {stop.startDate || 'TBD'} ➔ {stop.endDate || 'TBD'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => handleMoveStop(stopIdx, 'up')}
                      disabled={stopIdx === 0}
                      style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', cursor: stopIdx === 0 ? 'not-allowed' : 'pointer', opacity: stopIdx === 0 ? 0.3 : 1 }}
                      title="Move City Up"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      onClick={() => handleMoveStop(stopIdx, 'down')}
                      disabled={stopIdx === trip.stops.length - 1}
                      style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', cursor: stopIdx === trip.stops.length - 1 ? 'not-allowed' : 'pointer', opacity: stopIdx === trip.stops.length - 1 ? 0.3 : 1 }}
                      title="Move City Down"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px 8px' }}
                      title="Delete City Stop"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Activities inside City Stop */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Scheduled Activities ({stop.activities ? stop.activities.length : 0})
                    </span>
                    <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => handleOpenAddActivity(stop)}>
                      Add Activity
                    </Button>
                  </div>

                  {stop.activities && stop.activities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {stop.activities.map((act) => (
                        <div
                          key={act.id}
                          style={{
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            padding: '0.85rem 1rem',
                            backgroundColor: 'var(--surface)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary)' }}>
                              <Clock size={16} />
                            </div>

                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                {act.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                                <span>Category: {act.category || 'Sightseeing'}</span>
                                <span>Time: {act.time || '10:00 AM'}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.95rem' }}>
                              ${act.cost || act.estimatedCost || 0}
                            </span>
                            <button
                              onClick={() => handleRemoveActivity(stop.id, act.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                              title="Delete Activity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No activities planned for {stop.city} yet. Click "+ Add Activity" above.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border)' }}>
            <Compass size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <h3>No Destination Cities Added</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add your first destination city stop to build your itinerary.</p>
            <Button variant="primary" onClick={() => setIsAddStopOpen(true)}>Add Destination Stop</Button>
          </div>
        )}

        {/* Embedded Intercity Transport Manager (#11 in prompt) */}
        <TransportManager tripId={id} stops={trip.stops || []} onTransportChange={(segs) => { setTransportSegments(segs); refreshHealthAndBudget(); }} />

        {/* Embedded Calendar & Day-Wise View (#9 & #10 in prompt) */}
        <TripCalendarView trip={trip} onRemoveActivity={handleRemoveActivity} />

        {/* Add Stop Modal */}
        <Modal isOpen={isAddStopOpen} onClose={() => setIsAddStopOpen(false)} title="Add Destination City Stop">
          <form onSubmit={handleAddStopSubmit}>
            {stopError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                ⚠ {stopError}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Select City / Destination *</label>
              <select
                className="input-field"
                value={stopForm.city}
                onChange={(e) => {
                  const selectedCityObj = availableCities.find(c => c.name === e.target.value);
                  setStopForm({ ...stopForm, city: e.target.value, cityId: selectedCityObj ? selectedCityObj.id : null });
                }}
                required
              >
                <option value="">-- Choose a City --</option>
                {availableCities.map(c => (
                  <option key={c.id} value={c.name}>{c.name}, {c.country}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Stop Start Date"
                type="date"
                value={stopForm.startDate}
                onChange={(e) => setStopForm({ ...stopForm, startDate: e.target.value })}
                required
              />
              <Input
                label="Stop End Date"
                type="date"
                value={stopForm.endDate}
                onChange={(e) => setStopForm({ ...stopForm, endDate: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsAddStopOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Add City Stop</Button>
            </div>
          </form>
        </Modal>

        {/* Add Activity Modal */}
        <Modal isOpen={isAddActivityOpen} onClose={() => setIsAddActivityOpen(false)} title={`Add Activity to ${activeStopForActivity?.city || 'Stop'}`}>
          <form onSubmit={handleAddActivitySubmit}>
            {activityError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                ⚠ {activityError}
              </div>
            )}

            <Input
              label="Activity Name *"
              value={activityForm.name}
              onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
              placeholder="e.g. Guided Louvre Museum Tour"
              required
            />

            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={activityForm.category}
                onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food">Food & Dining</option>
                <option value="Culture">Culture & Art</option>
                <option value="Adventure">Adventure & Sports</option>
                <option value="Nature">Nature & Wildlife</option>
                <option value="Shopping">Shopping & Crafts</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Activity Date"
                type="date"
                value={activityForm.date}
                onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                required
              />
              <Input
                label="Scheduled Time"
                value={activityForm.time}
                onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                placeholder="e.g. 10:00 AM"
              />
            </div>

            <Input
              label="Estimated Cost ($)"
              type="number"
              value={activityForm.cost}
              onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
              placeholder="e.g. 35"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsAddActivityOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Add Activity</Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
