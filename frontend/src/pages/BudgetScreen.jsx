import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  DollarSign, 
  AlertTriangle, 
  Plane, 
  Hotel, 
  Utensils, 
  Ticket, 
  Calculator, 
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { getTrip, calculateTripBudget } from '../services/api';
import '../styles/dashboard.css';

export default function BudgetScreen({ user, onLogout }) {
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
          Calculating Trip Budget Breakdown...
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

  const budgetInfo = calculateTripBudget(trip);

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
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ Budget Analytics</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/trips')}
            >
              My Trips
            </Button>
          </div>

          {/* OVER-BUDGET WARNING BANNER */}
          {budgetInfo.isOverBudget && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #F87171',
                borderRadius: 'var(--radius-lg)',
                color: '#991B1B',
                marginBottom: '1.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: '#FEE2E2' }}>
                <AlertTriangle size={24} color="#DC2626" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 800 }}>
                  OVER-BUDGET ALERT!
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                  Estimated trip total (<strong>${budgetInfo.total}</strong>) exceeds your set budget (<strong>${budgetInfo.userBudget}</strong>) by <strong>${Math.abs(budgetInfo.remainingBudget)}</strong>. Consider adjusting activities or stay options.
                </p>
              </div>
            </div>
          )}

          {!budgetInfo.isOverBudget && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #4ADE80',
                borderRadius: 'var(--radius-lg)',
                color: '#166534',
                marginBottom: '1.75rem'
              }}
            >
              <CheckCircle size={22} color="#16A34A" />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Great job! Your trip costs are well within your set budget of <strong>${budgetInfo.userBudget}</strong>.
              </span>
            </div>
          )}

          {/* Top Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Total Estimated Cost */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Estimated Cost</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0 0' }}>
                ${budgetInfo.total}
              </h2>
            </div>

            {/* Set Budget */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target User Budget</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.35rem 0 0 0' }}>
                ${budgetInfo.userBudget}
              </h2>
            </div>

            {/* Remaining Budget */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Remaining Balance</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: budgetInfo.isOverBudget ? 'var(--danger)' : 'var(--success)', margin: '0.35rem 0 0 0' }}>
                {budgetInfo.remainingBudget >= 0 ? `$${budgetInfo.remainingBudget}` : `-$${Math.abs(budgetInfo.remainingBudget)}`}
              </h2>
            </div>

            {/* Daily Avg Cost */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Average Daily Cost</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', margin: '0.35rem 0 0 0' }}>
                ${budgetInfo.avgDailyCost} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ day</span>
              </h2>
            </div>
          </div>

          {/* DETAILED CATEGORY BREAKDOWN LIST */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator color="var(--primary)" size={24} />
              Expense Category Breakdown
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Transport */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', backgroundColor: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '10px', background: '#DBEAFE', borderRadius: '10px', color: '#1D4ED8' }}>
                    <Plane size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Transport & Transfers</h4>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Intercity flights, local transit & train passes</span>
                  </div>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ${budgetInfo.transport}
                </span>
              </div>

              {/* Stay */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', backgroundColor: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '10px', background: '#FCE7F3', borderRadius: '10px', color: '#BE185D' }}>
                    <Hotel size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Accommodation & Stay</h4>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Hotels, boutique stays & rentals ({budgetInfo.durationDays} nights)</span>
                  </div>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ${budgetInfo.stay}
                </span>
              </div>

              {/* Activities */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', backgroundColor: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '10px', background: '#FEF3C7', borderRadius: '10px', color: '#B45309' }}>
                    <Ticket size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Tours & Activities</h4>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Museum tickets, guided excursions & entrance fees</span>
                  </div>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ${budgetInfo.activities}
                </span>
              </div>

              {/* Meals */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', backgroundColor: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '10px', background: '#DCFCE7', borderRadius: '10px', color: '#15803D' }}>
                    <Utensils size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Meals & Dining</h4>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Breakfast, dinners & street food allowances</span>
                  </div>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ${budgetInfo.meals}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
