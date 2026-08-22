import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Copy, Check, Calendar, MapPin, DollarSign, Compass, Globe, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { getTrip, calculateTripBudget } from '../services/api';
import '../styles/dashboard.css';

export default function PublicShareScreen({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    setLoading(true);
    try {
      const data = await getTrip(id);
      setTrip(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const shareableUrl = window.location.href;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar user={user} onLogout={onLogout} />
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Public Share View...
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
  const budgetInfo = calculateTripBudget(trip);

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content" style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Top Read-only Indicator & Share Banner */}
          <div
            style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="tag-badge" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Globe size={14} /> Public Share View
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Read-only view for friends & travel companions
              </span>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={copied ? <Check size={18} /> : <Copy size={18} />}
              onClick={handleCopyLink}
            >
              {copied ? 'Link Copied!' : 'Copy Share Link'}
            </Button>
          </div>

          {/* Copied Toast Alert */}
          {copied && (
            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={18} /> Share link copied to clipboard! Anyone with this link can view the itinerary.
            </div>
          )}

          {/* Hero Banner */}
          <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <img
                src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                alt={trip.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)' }} />

              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: '#fff' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {trip.name || trip.destination}
                </h1>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.925rem', opacity: 0.9 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={16} /> {trip.startDate} to {trip.endDate} ({trip.durationDays} Days)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={16} /> {stops.length} Cities
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#FCD34D' }}>
                    <DollarSign size={16} /> Est. Budget: ${budgetInfo.total}
                  </span>
                </div>
              </div>
            </div>

            {trip.description && (
              <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--surface)', fontSize: '0.95rem', color: 'var(--text-main)', borderTop: '1px solid var(--border)' }}>
                <strong>Trip Summary:</strong> {trip.description}
              </div>
            )}
          </div>

          {/* CITIES & READ-ONLY ITINERARY */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass color="var(--primary)" size={24} />
              Read-Only Itinerary Schedule
            </h2>

            {stops.map((stop, sIdx) => (
              <div key={stop.id} className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', fontWeight: 800 }}>
                      Stop {sIdx + 1}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {stop.city}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {stop.startDate} – {stop.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activities under stop */}
                {stop.activities && stop.activities.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {stop.activities.map((act) => (
                      <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.15rem', backgroundColor: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {act.name}
                          </h4>
                          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                            Time: {act.time}
                          </span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>
                          ${act.cost || act.estimatedCost || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No activities scheduled for {stop.city} yet.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
