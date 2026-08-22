import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import {
  Compass, MapPin, Calendar, DollarSign, Plus, Eye, Edit, Trash2,
  Copy, Sparkles, TrendingUp, CheckCircle, AlertTriangle, User
} from 'lucide-react';
import {
  getTrips,
  deleteTrip,
  duplicateTrip,
  authService,
  tripService,
  calculateTripBudget
} from '../services/api';
import '../styles/dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      const tripsData = await getTrips();
      setTrips(tripsData);

      const recs = await tripService.getRecommendedDestinations();
      setRecommendations(recs);
    } catch (err) {
      console.error('Dashboard load error:', err);
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

  // Metrics Calculations
  const totalTripsCount = trips.length;
  const totalPlannedCities = trips.reduce((sum, t) => sum + (t.stops ? t.stops.length : 0), 0);
  const totalPlannedActivities = trips.reduce((sum, t) => {
    const stopActs = (t.stops || []).reduce((sSum, s) => sSum + (s.activities ? s.activities.length : 0), 0);
    return sum + stopActs;
  }, 0);
  const totalEstimatedBudget = trips.reduce((sum, t) => sum + (Number(t.budget) || 0), 0);

  // Categorize trips by status
  const upcomingTrips = trips.filter(t => t.status === 'Upcoming' || t.status === 'Ongoing');
  const planningTrips = trips.filter(t => t.status === 'Planning');
  const completedTrips = trips.filter(t => t.status === 'Completed');

  const getStatusBadgeClass = (status) => {
    if (status === 'Ongoing') return 'status-ongoing';
    if (status === 'Upcoming') return 'status-upcoming';
    if (status === 'Completed') return 'status-completed';
    return 'status-planning';
  };

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="dashboard" />

      <main className="dashboard-content">
        {/* Welcome Banner */}
        <section className="welcome-banner" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)', color: '#fff', padding: '2rem 2.5rem', borderRadius: 'var(--radius-xl)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>
              Welcome back, {user ? user.name : 'Traveler'}! 👋
            </h1>
            <p style={{ margin: '0.4rem 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
              Your global itinerary planner is active. Explore destinations, optimize budgets, and plan seamless adventures.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            icon={<Plus size={18} />}
            onClick={() => navigate('/trips/create')}
            style={{ backgroundColor: '#fff', color: 'var(--primary)', fontWeight: 700 }}
          >
            Plan New Trip
          </Button>
        </section>

        {/* Real User Metrics Counters */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Trips</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{totalTripsCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active & saved itineraries</div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Planned Cities</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>{totalPlannedCities}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Destinations in route</div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Scheduled Activities</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{totalPlannedActivities}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Tours & attractions</div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Estimated Budget</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>${totalEstimatedBudget.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Combined trip target</div>
          </div>
        </section>

        {/* Upcoming & Active Trips */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={22} color="var(--primary)" /> Upcoming & Active Adventures
            </h2>
            <Link to="/trips" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              View All Trips →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading trips...</div>
          ) : upcomingTrips.length > 0 || planningTrips.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {[...upcomingTrips, ...planningTrips].slice(0, 6).map((trip) => {
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
                        <Button variant="primary" size="sm" icon={<Eye size={14} />} onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}>
                          View Itinerary
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
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border)' }}>
              <Compass size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <h3>No upcoming trips found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Start by creating your first custom itinerary.</p>
              <Button variant="primary" onClick={() => navigate('/trips/create')}>Create a Trip</Button>
            </div>
          )}
        </section>

        {/* Smart Recommendations Section */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={22} color="var(--accent)" /> Smart Recommended Destinations
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Deterministic recommendation score based on budget, travel style, and popularity.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem' }}>
            {recommendations.map((rec) => (
              <div key={rec.id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '10px' }}>
                      {rec.matchScore}% Match
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>★ 4.8</span>
                  </div>

                  <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {rec.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    📍 {rec.location}
                  </div>

                  <div style={{ background: 'var(--neutral-bg)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '3px', color: 'var(--primary)' }}>Why Recommended:</div>
                    {(rec.whyRecommended || []).map((reason, rIdx) => (
                      <div key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                        ✓ {reason}
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => navigate('/cities')}>
                  Explore City
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
