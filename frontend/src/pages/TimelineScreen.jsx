import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitCommit, Clock, MapPin, Calendar, DollarSign, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { getTrip } from '../services/api';
import '../styles/dashboard.css';

export default function TimelineScreen({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar user={user} onLogout={onLogout} />
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Generating Interactive Timeline...
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

  // Generate day-by-day chronological timeline sequence
  const timelineDays = [];
  let dayCounter = 1;

  stops.forEach((stop) => {
    if (stop.activities && stop.activities.length > 0) {
      stop.activities.forEach((act) => {
        timelineDays.push({
          day: act.dayNumber || dayCounter,
          date: act.date || stop.startDate,
          city: stop.city,
          activityName: act.name,
          time: act.time || '10:00 AM',
          cost: act.cost || act.estimatedCost || 0
        });
        dayCounter += 1;
      });
    } else {
      timelineDays.push({
        day: dayCounter,
        date: stop.startDate,
        city: stop.city,
        activityName: `Arrival & City Check-in at ${stop.city}`,
        time: '12:00 PM',
        cost: 0
      });
      dayCounter += 1;
    }
  });

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content" style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate(`/trips/${id}`)}
              >
                Back to Itinerary
              </Button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ Chronological Timeline</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/trips')}
            >
              My Trips
            </Button>
          </div>

          {/* Timeline Container Card */}
          <div
            className="card"
            style={{
              padding: '2rem 2.5rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div style={{ marginBottom: '2rem' }}>
              <span className="tag-badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '0.5rem', display: 'inline-block' }}>
                Timeline Mode
              </span>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitCommit color="var(--primary)" size={28} />
                {trip.name || trip.destination} – Timeline
              </h1>
            </div>

            {timelineDays.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No itinerary timeline events found.
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '2.25rem' }}>
                {/* Vertical Connecting Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '12px',
                    bottom: '12px',
                    width: '3px',
                    backgroundColor: 'var(--primary-light)',
                    borderRadius: '2px'
                  }}
                />

                {timelineDays.map((item, idx) => (
                  <div key={idx} style={{ position: 'relative', marginBottom: '2rem' }}>
                    {/* Node Circle */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-2.25rem',
                        top: '4px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        border: '4px solid var(--primary)',
                        boxShadow: '0 0 0 3px rgba(15,76,129,0.15)'
                      }}
                    />

                    {/* Timeline Item Box */}
                    <div
                      style={{
                        backgroundColor: 'var(--neutral-bg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: 'var(--primary)', color: '#fff' }}>
                            Day {item.day}
                          </span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MapPin size={14} color="var(--primary)" /> {item.city}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', background: 'rgba(234,88,12,0.1)', padding: '3px 10px', borderRadius: '12px' }}>
                          ${item.cost}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.activityName}
                      </h3>

                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} /> Time: {item.time}
                        </span>
                        {item.date && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} /> Date: {item.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
