import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import {
  Compass, MapPin, Calendar, Clock, DollarSign, Share2, Copy, Check,
  ExternalLink, User, Lock, Sparkles, AlertTriangle
} from 'lucide-react';
import { getSharedTrip, copySharedTrip, authService, calculateTripBudget } from '../services/api';
import '../styles/dashboard.css';

export default function PublicShareScreen() {
  const { shareId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadSharedTrip();
    checkUserSession();
  }, [shareId]);

  const loadSharedTrip = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSharedTrip(shareId);
      setTrip(data);
    } catch (err) {
      setError(err.message || 'Shared trip not found or public link disabled.');
    } finally {
      setLoading(false);
    }
  };

  const checkUserSession = async () => {
    const usr = await authService.getCurrentUser();
    setCurrentUser(usr);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyTripToAccount = async () => {
    if (!currentUser) {
      alert('Please log in to your GlobeTrotter account to copy this trip.');
      navigate('/login');
      return;
    }

    setCopying(true);
    try {
      const newTrip = await copySharedTrip(shareId);
      alert(`Trip "${newTrip.name}" duplicated to your profile!`);
      navigate(`/trips/${newTrip.id}`);
    } catch (err) {
      alert(err.message || 'Failed to copy trip.');
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Compass size={40} className="spinning" color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <div>Loading Shared Itinerary...</div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-bg)', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', backgroundColor: 'var(--surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <Lock size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Shared Trip Unavailable</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            {error || 'This itinerary link is private or has been disabled by the trip owner.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Go to GlobeTrotter Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const budgetInfo = calculateTripBudget(trip, [], trip.transportSegments || []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-bg)' }}>
      {/* Top Navbar */}
      <header style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={22} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', tracking: '-0.5px' }}>
            GlobeTrotter
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="outline" size="sm" icon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={handleCopyLink}>
            {copied ? 'Link Copied!' : 'Copy Share Link'}
          </Button>

          <Button variant="primary" size="sm" icon={<Sparkles size={14} />} loading={copying} onClick={handleCopyTripToAccount}>
            Copy Trip to My Account
          </Button>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.25rem' }}>
        {/* Cover Hero Banner */}
        <div style={{ height: '260px', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
            alt={trip.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem', color: '#fff' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: '#fff', padding: '3px 12px', borderRadius: '12px', width: 'fit-content', marginBottom: '0.5rem' }}>
              Public Shared Itinerary (Read-Only)
            </div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900 }}>{trip.name}</h1>
            <div style={{ fontSize: '0.95rem', opacity: 0.9, marginTop: '0.3rem', display: 'flex', gap: '1.25rem' }}>
              <span><Calendar size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {trip.startDate} ➔ {trip.endDate}</span>
              <span><User size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Shared by {trip.ownerName || 'GlobeTrotter Traveler'}</span>
            </div>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CITIES</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
              {trip.stops ? trip.stops.length : 0} Stops
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DURATION</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>
              {trip.durationDays || 7} Days
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED COST</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              ${budgetInfo.totalEstimated}
            </div>
          </div>
        </div>

        {/* Read-Only Itinerary Hierarchy */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            📍 Destination Itinerary & Schedule
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(trip.stops || []).map((stop, sIdx) => (
              <div key={stop.id || sIdx} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--neutral-bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)' }}>
                      Stop {sIdx + 1}: {stop.city}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Dates: {stop.startDate} ➔ {stop.endDate}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {stop.activities && stop.activities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {stop.activities.map(act => (
                        <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{act.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              🕒 {act.time || '10:00 AM'} • {act.category || 'Sightseeing'}
                            </div>
                          </div>
                          <span style={{ fontWeight: 800, color: 'var(--accent)' }}>${act.cost || 0}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activities listed for this stop.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
