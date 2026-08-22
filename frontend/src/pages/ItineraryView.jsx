import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  List, 
  Clock, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Compass, 
  CheckCircle2, 
  Sparkles,
  GitCommit
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { getTrip } from '../services/api';
import '../styles/dashboard.css';

export default function ItineraryView({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'timeline'

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    setLoading(true);
    try {
      const data = await getTrip(id);
      setTrip(data);
    } catch (err) {
      console.error('Error loading trip view:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar user={user} onLogout={onLogout} />
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Itinerary Details...
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

  // Flatten all activities with city and day metadata for clean timeline rendering
  const allTimelineItems = [];
  let currentDayCounter = 1;

  stops.forEach((stop) => {
    if (stop.activities && stop.activities.length > 0) {
      stop.activities.forEach((act) => {
        allTimelineItems.push({
          ...act,
          cityName: stop.city,
          stopDateRange: `${stop.startDate} - ${stop.endDate}`,
          calculatedDay: act.dayNumber || currentDayCounter
        });
        currentDayCounter += 1;
      });
    } else {
      // If a stop has no activities, add a placeholder node for the city stop
      allTimelineItems.push({
        id: `empty_${stop.id}`,
        name: `Arrive & Check-in at ${stop.city}`,
        time: '12:00 PM',
        cost: 0,
        cityName: stop.city,
        calculatedDay: currentDayCounter,
        date: stop.startDate
      });
      currentDayCounter += 1;
    }
  });

  // Calculate total itinerary cost
  const totalCost = stops.reduce((acc, stop) => {
    const stopCost = (stop.activities || []).reduce((a, act) => a + (Number(act.cost) || 0), 0);
    return acc + stopCost;
  }, 0);

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content" style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Action Header */}
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
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ Itinerary View</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* View Toggle */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--surface)',
                  padding: '3px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                    color: viewMode === 'list' ? '#fff' : 'var(--text-muted)',
                    transition: 'var(--transition)'
                  }}
                >
                  <List size={15} /> List
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'timeline' ? 'var(--primary)' : 'transparent',
                    color: viewMode === 'timeline' ? '#fff' : 'var(--text-muted)',
                    transition: 'var(--transition)'
                  }}
                >
                  <GitCommit size={15} /> Timeline
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={<DollarSign size={15} />}
                onClick={() => navigate(`/trips/${id}/budget`)}
              >
                Budget
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={<GitCommit size={15} />}
                onClick={() => navigate(`/trips/${id}/timeline`)}
              >
                Full Timeline
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={<Edit3 size={15} />}
                onClick={() => navigate(`/trips/${id}/builder`)}
              >
                Edit
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles size={15} />}
                onClick={() => navigate(`/trips/${id}/share`)}
              >
                Share Trip
              </Button>
            </div>
          </div>

          {/* Hero Banner Card */}
          <div
            className="card"
            style={{
              marginBottom: '2rem',
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              position: 'relative'
            }}
          >
            <div style={{ height: '200px', width: '100%', position: 'relative' }}>
              <img
                src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                alt={trip.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)' }} />
              
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: '#fff' }}>
                <span className="tag-badge" style={{ backgroundColor: 'var(--accent)', color: '#fff', marginBottom: '0.5rem', display: 'inline-block' }}>
                  {trip.status || 'Active Plan'}
                </span>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {trip.name || trip.destination}
                </h1>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', opacity: 0.9 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={15} /> {trip.startDate} to {trip.endDate} ({trip.durationDays} Days)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={15} /> {stops.length} Cities
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#FCD34D' }}>
                    <DollarSign size={15} /> Total Activities Cost: ${totalCost}
                  </span>
                </div>
              </div>
            </div>
            {trip.description && (
              <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--surface)', fontSize: '0.925rem', color: 'var(--text-main)', borderTop: '1px solid var(--border)' }}>
                <strong>Trip Overview:</strong> {trip.description}
              </div>
            )}
          </div>

          {/* VIEW RENDERER */}
          {stops.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <Compass size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <h3>No Itinerary Stops Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Use the Itinerary Builder to add stops and daily activities.</p>
              <Button variant="primary" icon={<Edit3 size={16} />} onClick={() => navigate(`/trips/${id}/builder`)}>
                Open Builder
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            /* --- LIST VIEW --- */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {stops.map((stop, stopIdx) => {
                const stopTotal = (stop.activities || []).reduce((acc, act) => acc + (Number(act.cost) || 0), 0);
                return (
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
                    {/* Stop Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                          Stop {stopIdx + 1}
                        </div>
                        <div>
                          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {stop.city}
                          </h2>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                            <Calendar size={13} /> {stop.startDate} – {stop.endDate}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Stop Total</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                          ${stopTotal}
                        </span>
                      </div>
                    </div>

                    {/* Activities List */}
                    {stop.activities && stop.activities.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {stop.activities.map((act, actIdx) => (
                          <div
                            key={act.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '1rem 1.25rem',
                              backgroundColor: 'var(--neutral-bg)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                Day {act.dayNumber || (actIdx + 1)}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                  {act.name}
                                </h4>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={13} /> {act.time}
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={13} /> {stop.city}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div style={{ padding: '4px 12px', background: 'rgba(245, 158, 11, 0.12)', color: '#D97706', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}>
                              ${act.cost || 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No scheduled activities for this stop yet.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* --- TIMELINE VIEW --- */
            <div
              className="card"
              style={{
                padding: '2rem 2.5rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitCommit color="var(--primary)" size={24} />
                Visual Timeline Roadmap
              </h2>

              <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Vertical Timeline Track Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '7px',
                    top: '10px',
                    bottom: '10px',
                    width: '3px',
                    backgroundColor: 'var(--primary-light)',
                    borderRadius: '2px'
                  }}
                />

                {allTimelineItems.map((item, idx) => (
                  <div key={item.id} style={{ position: 'relative', marginBottom: '2rem' }}>
                    {/* Node Dot on Timeline */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-2rem',
                        top: '4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        border: '4px solid var(--primary)',
                        boxShadow: '0 0 0 3px rgba(15,76,129,0.15)'
                      }}
                    />

                    {/* Timeline Item Card */}
                    <div
                      style={{
                        backgroundColor: 'var(--neutral-bg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: 'var(--primary)', color: '#fff' }}>
                            Day {item.calculatedDay}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={13} /> {item.cityName}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', background: 'rgba(234,88,12,0.1)', padding: '2px 10px', borderRadius: '12px' }}>
                          ${item.cost || 0}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.name}
                      </h3>

                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} /> {item.time}
                        </span>
                        {item.date && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} /> {item.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
