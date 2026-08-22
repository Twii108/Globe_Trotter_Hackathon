import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import {
  getTrip,
  getExpenses,
  addExpense,
  getTransportSegments,
  calculateTripBudget
} from '../services/api';
import {
  DollarSign, Plus, AlertTriangle, ArrowLeft, PieChart as PieChartIcon, TrendingUp,
  Receipt, Plane, Bed, Utensils, Activity, Tag, Trash2, Calendar
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import '../styles/dashboard.css';

export default function BudgetScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [transportSegments, setTransportSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expense Logger Modal
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Miscellaneous',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const tripData = await getTrip(id);
      setTrip(tripData);

      const expData = await getExpenses(id);
      setExpenses(expData);

      const transData = await getTransportSegments(id);
      setTransportSegments(transData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    setSubmitting(true);
    try {
      const newExp = await addExpense(id, {
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        description: expenseForm.description,
        expenseDate: expenseForm.expenseDate
      });

      setExpenses([newExp, ...expenses]);
      setIsAddExpenseOpen(false);
      setExpenseForm({
        category: 'Miscellaneous',
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      alert('Failed to log expense.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="dashboard-layout">
        <Navbar activeTab="my-trips" />
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Budget Engine...
        </div>
      </div>
    );
  }

  // Single Central Budget Engine Calculation (#12 in prompt)
  const budgetInfo = calculateTripBudget(trip, expenses, transportSegments);

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="my-trips" />

      <main className="dashboard-content" style={{ maxWidth: '1050px', margin: '0 auto' }}>
        {/* Header Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <button
              onClick={() => navigate(`/trips/${id}`)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0, marginBottom: '0.4rem' }}
            >
              <ArrowLeft size={16} /> Back to Itinerary Builder
            </button>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Budget & Expense Tracker
            </h1>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {trip.name} • Target Budget: ${budgetInfo.userBudget}
            </span>
          </div>

          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsAddExpenseOpen(true)}>
            Log Actual Expense
          </Button>
        </div>

        {/* OVER-BUDGET WARNING BANNER (#14 in prompt) */}
        {budgetInfo.isOverBudget && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.09)', border: '1px solid var(--danger)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={24} color="var(--danger)" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem', color: 'var(--danger)', fontSize: '1.05rem', fontWeight: 800 }}>
                OVER-BUDGET ALERT!
              </h3>
              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                Your estimated trip cost (${budgetInfo.effectiveSpending}) exceeds your allocated budget (${budgetInfo.userBudget}) by <strong>${Math.abs(budgetInfo.remainingBudget)}</strong>. Consider adjusting activities or stay options.
              </p>
            </div>
          </div>
        )}

        {/* METRICS CARDS GRID (#12 in prompt) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Target Budget</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>${budgetInfo.userBudget}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Set by trip owner</div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Effective Spending</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: budgetInfo.isOverBudget ? 'var(--danger)' : 'var(--accent)', marginTop: '4px' }}>
              ${budgetInfo.effectiveSpending}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {budgetInfo.actualExpenses > 0 ? `Logged: $${budgetInfo.actualExpenses}` : 'Estimated total'}
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Remaining Budget</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: budgetInfo.remainingBudget >= 0 ? '#10b981' : 'var(--danger)', marginTop: '4px' }}>
              ${budgetInfo.remainingBudget}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{budgetInfo.percentageUsed}% of budget used</div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Daily Cost</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>${budgetInfo.avgDailyCost}/day</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Over {budgetInfo.durationDays} days</div>
          </div>
        </div>

        {/* CATEGORY COST BREAKDOWN PROGRESS BARS */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChartIcon size={20} color="var(--primary)" /> Expense Category Breakdown
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {/* Pie Chart */}
            <div style={{ flex: '1 1 300px', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Transport', value: budgetInfo.categoryTotals.Transport || budgetInfo.transport, color: '#0f4c81' },
                      { name: 'Accommodation', value: budgetInfo.categoryTotals.Accommodation || budgetInfo.stay, color: '#fca311' },
                      { name: 'Activities', value: budgetInfo.categoryTotals.Activities || budgetInfo.activities, color: '#10b981' },
                      { name: 'Meals', value: budgetInfo.categoryTotals.Meals || budgetInfo.meals, color: '#f59e0b' }
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Transport', value: budgetInfo.categoryTotals.Transport || budgetInfo.transport, color: '#0f4c81' },
                      { name: 'Accommodation', value: budgetInfo.categoryTotals.Accommodation || budgetInfo.stay, color: '#fca311' },
                      { name: 'Activities', value: budgetInfo.categoryTotals.Activities || budgetInfo.activities, color: '#10b981' },
                      { name: 'Meals', value: budgetInfo.categoryTotals.Meals || budgetInfo.meals, color: '#f59e0b' }
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Bar Chart for Daily Expenses */}
            <div style={{ flex: '1 1 400px', height: '300px' }}>
               <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--text-main)', textAlign: 'center' }}>Daily Expenses</h4>
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={
                  Object.values(expenses.reduce((acc, exp) => {
                    const date = exp.expenseDate || exp.expense_date || new Date().toISOString().split('T')[0];
                    if (!acc[date]) acc[date] = { date, amount: 0 };
                    acc[date].amount += Number(exp.amount);
                    return acc;
                  }, {})).sort((a, b) => new Date(a.date) - new Date(b.date))
                }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="var(--primary)" name="Total Spent ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* LOGGED ACTUAL EXPENSES LIST (#13 in prompt) */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={20} color="var(--primary)" /> Actual Expense Log ({expenses.length})
            </h3>
            <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => setIsAddExpenseOpen(true)}>
              Add Expense
            </Button>
          </div>

          {expenses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1.25rem',
                    backgroundColor: 'var(--neutral-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {exp.description || exp.category}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                      <span>Category: <strong>{exp.category}</strong></span>
                      <span><Calendar size={12} /> {exp.expenseDate}</span>
                    </div>
                  </div>

                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent)' }}>
                    ${exp.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No actual expenses logged yet. Click "+ Log Actual Expense" to record receipts.
            </div>
          )}
        </div>

        {/* Log Expense Modal */}
        <Modal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Log Actual Expense Receipt">
          <form onSubmit={handleAddExpenseSubmit}>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              >
                <option value="Transport">Transport</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Activities">Activities</option>
                <option value="Meals">Meals & Dining</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <Input
              label="Amount ($) *"
              type="number"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              placeholder="e.g. 85"
              required
            />

            <Input
              label="Expense Date"
              type="date"
              value={expenseForm.expenseDate}
              onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
              required
            />

            <div className="input-group">
              <label className="input-label">Description / Note</label>
              <input
                className="input-field"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="e.g. Dinner at traditional bistro"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={submitting}>Log Expense</Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
