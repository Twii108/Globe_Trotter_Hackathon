import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TripSubNav from '../components/TripSubNav';
import TripHealthCard from '../components/TripHealthCard';
import Button from '../components/Button';
import { ArrowLeft, Activity } from 'lucide-react';
import { getTripHealth } from '../services/api';
import toast from 'react-hot-toast';

export default function TripHealthScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, [id]);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const data = await getTripHealth(id);
      setHealthData(data);
    } catch (err) {
      toast.error('Failed to load trip health metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="my-trips" />
      <TripSubNav tripId={id} activeTab="health" />

      <main className="dashboard-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate(`/trips/${id}/builder`)}
                style={{ marginBottom: '0.5rem' }}
              >
                Back to Builder
              </Button>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity color="var(--primary)" size={28} />
                Trip Health & Optimization
              </h1>
              <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Smart analysis of pacing, budget distribution, date conflicts, and travel feasibility.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Analyzing trip health...
            </div>
          ) : healthData ? (
            <TripHealthCard health={healthData} />
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Health metrics unavailable.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
