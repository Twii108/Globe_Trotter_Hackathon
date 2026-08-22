import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  Compass, 
  Star, 
  TrendingUp, 
  RefreshCw,
  FolderX
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { tripService, authService } from '../services/api';
import '../styles/dashboard.css';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user || null);
  const [trips, setTrips] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [budget, setBudget] = useState({ totalBudget: 0, totalSpent: 0, remaining: 0, currency: '$' });
  const [loading, setLoading] = useState(true);

  // New Trip Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTripData, setNewTripData] = useState({
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    budget: '',
    tags: ''
  });
  const [submittingTrip, setSubmittingTrip] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (!user) {
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData);
      }
      const [tripsData, recsData, budgetData] = await Promise.all([
        tripService.getUpcomingTrips(),
        tripService.getRecommendedDestinations(),
        tripService.getBudgetSummary()
      ]);
      setTrips(tripsData);
      setRecommendations(recsData);
      setBudget(budgetData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTripSubmit = async (e) => {
    e.preventDefault();
    if (!newTripData.destination.trim()) {
      alert('Please enter a destination name.');
      return;
    }

    setSubmittingTrip(true);
    try {
      const created = await tripService.createTrip({
        ...newTripData,
        tags: newTripData.tags ? newTripData.tags.split(',').map(t => t.trim()) : ['Vacation']
      });
      setTrips((prev) => [created, ...prev]);
      
      // Update budget
      const updatedBudget = await tripService.getBudgetSummary();
      setBudget(updatedBudget);

      // Reset modal and navigate to builder
      setNewTripData({ destination: '', country: '', startDate: '', endDate: '', budget: '', tags: '' });
      setIsModalOpen(false);
      navigate(`/trips/${created.id}/builder`);
    } catch (err) {
      alert('Failed to create trip. Please try again.');
    } finally {
      setSubmittingTrip(false);
    }
  };

  const handleClearTripsToggle = async () => {
    if (trips.length > 0) {
      await tripService.clearTrips();
      setTrips([]);
      setBudget({ totalBudget: 0, totalSpent: 0, remaining: 0, currency: '$' });
    } else {
      const restored = await tripService.restoreDefaultTrips();
      setTrips(restored);
      const updatedBudget = await tripService.getBudgetSummary();
      setBudget(updatedBudget);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar user={currentUser} onLogout={onLogout} />

      <main className="dashboard-content">
        <div className="container">
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <div className="welcome-banner-content">
              <span className="welcome-tag">
                <Sparkles size={14} /> Explorer Pass Active
              </span>
              <h1 className="welcome-title">
                Welcome back, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Explorer'}!
              </h1>
              <p className="welcome-subtitle">
                Ready for your next adventure? You have {trips.length} upcoming {trips.length === 1 ? 'trip' : 'trips'} planned.
              </p>
              <div className="welcome-actions">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Plus size={18} />}
                  onClick={() => navigate('/trips/create')}
                >
                  Plan New Trip
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={<RefreshCw size={16} />}
                  onClick={handleClearTripsToggle}
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  {trips.length > 0 ? 'Simulate Empty State' : 'Restore Demo Trips'}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Dashboard Layout Grid */}
          <div className="dashboard-grid">
            <div className="dashboard-main">
              {/* Upcoming Trips Section */}
              <section id="upcoming-trips" className="dashboard-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <MapPin className="section-title-icon" size={22} />
                    Upcoming Trips
                  </h2>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus size={16} />}
                    onClick={() => navigate('/trips/create')}
                  >
                    New Trip
                  </Button>
                </div>

                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading your itineraries...
                  </div>
                ) : trips.length > 0 ? (
                  <div className="trips-grid">
                    {trips.map((trip) => (
                      <Card
                        key={trip.id}
                        image={trip.coverImage}
                        badge={trip.status}
                        title={trip.name || trip.destination}
                        footer={
                          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              Budget: ${trip.budget}
                            </span>
                            <Button variant="text" size="sm" onClick={() => navigate(`/trips/${trip.id}`)}>
                              View Details
                            </Button>
                          </div>
                        }
                      >
                        <div className="trip-meta">
                          <div className="trip-meta-item">
                            <Calendar size={14} />
                            <span>{trip.startDate} ({trip.durationDays} days)</span>
                          </div>
                        </div>

                        {trip.tags && trip.tags.length > 0 && (
                          <div className="trip-tags">
                            {trip.tags.map((tag, idx) => (
                              <span key={idx} className="tag-badge">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FolderX size={32} />
                    </div>
                    <h3 className="empty-state-title">No Trips Scheduled Yet</h3>
                    <p className="empty-state-text">
                      You haven't planned any trips yet. Start mapping out your dream destination or discover recommended spots below!
                    </p>
                    <Button
                      variant="primary"
                      icon={<Plus size={18} />}
                      onClick={() => setIsModalOpen(true)}
                    >
                      Create Your First Trip
                    </Button>
                  </div>
                )}
              </section>

              {/* Recommended Destinations Section */}
              <section id="recommendations" className="dashboard-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <Compass className="section-title-icon" size={22} />
                    Recommended Destinations
                  </h2>
                </div>

                <div className="recommendations-grid">
                  {recommendations.map((rec) => (
                    <Card
                      key={rec.id}
                      image={rec.image}
                      badge={rec.category}
                      title={rec.title}
                      footer={
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="rec-card-price">${rec.estimatedCost}</span>
                          <Button variant="outline" size="sm">
                            Explore
                          </Button>
                        </div>
                      }
                    >
                      <div className="trip-meta">
                        <div className="trip-meta-item">
                          <MapPin size={14} />
                          <span>{rec.location}</span>
                        </div>
                        <div className="trip-meta-item" style={{ color: '#F59E0B' }}>
                          <Star size={14} fill="#F59E0B" />
                          <span>{rec.rating} ({rec.reviewsCount})</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Widgets */}
            <aside className="dashboard-sidebar">
              {/* Budget Summary Widget */}
              <div id="budget" className="budget-widget">
                <div className="budget-header">
                  <h3 className="budget-title">
                    <DollarSign size={20} color="var(--primary)" />
                    Budget Overview
                  </h3>
                  <span className="tag-badge" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                    Active Track
                  </span>
                </div>

                <div className="budget-total">
                  {budget.currency}{budget.totalBudget.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  Total Planned Budget across all trips
                </div>

                <div className="budget-progress-bar">
                  <div
                    className="budget-progress-fill"
                    style={{
                      width: `${budget.totalBudget > 0 ? Math.min(100, (budget.totalSpent / budget.totalBudget) * 100) : 0}%`
                    }}
                  />
                </div>

                <div className="budget-stats">
                  <div>
                    <div className="budget-stat-label">Spent</div>
                    <div className="budget-stat-value" style={{ color: 'var(--accent)' }}>
                      {budget.currency}{budget.totalSpent.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="budget-stat-label">Remaining</div>
                    <div className="budget-stat-value">
                      {budget.currency}{budget.remaining.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Insight Card */}
              <div
                className="card"
                style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'linear-gradient(180deg, #F8FAFC 0%, #EBF3FA 100%)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                  <TrendingUp size={18} />
                  <span>Travel Smart Tip</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Booking flights 6 to 8 weeks in advance for domestic travel and 3 to 4 months for international trips yields average savings of up to 24%.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Plan New Trip Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Plan New Trip"
        maxWidth="580px"
      >
        <form onSubmit={handleCreateTripSubmit}>
          <Input
            label="Destination Name"
            name="destination"
            value={newTripData.destination}
            onChange={(e) => setNewTripData({ ...newTripData, destination: e.target.value })}
            placeholder="e.g. Paris & Normandy"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Country"
              name="country"
              value={newTripData.country}
              onChange={(e) => setNewTripData({ ...newTripData, country: e.target.value })}
              placeholder="e.g. France"
            />
            <Input
              label="Estimated Budget ($)"
              type="number"
              name="budget"
              value={newTripData.budget}
              onChange={(e) => setNewTripData({ ...newTripData, budget: e.target.value })}
              placeholder="e.g. 2500"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Start Date"
              type="date"
              name="startDate"
              value={newTripData.startDate}
              onChange={(e) => setNewTripData({ ...newTripData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              name="endDate"
              value={newTripData.endDate}
              onChange={(e) => setNewTripData({ ...newTripData, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Tags / Interests (comma separated)"
            name="tags"
            value={newTripData.tags}
            onChange={(e) => setNewTripData({ ...newTripData, tags: e.target.value })}
            placeholder="e.g. Food, Museums, Architecture"
          />

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submittingTrip}
              icon={<Plus size={18} />}
            >
              Create Trip
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
