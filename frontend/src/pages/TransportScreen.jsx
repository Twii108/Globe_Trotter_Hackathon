import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TripSubNav from '../components/TripSubNav';
import TransportManager from '../components/TransportManager';
import Button from '../components/Button';
import { ArrowLeft, Navigation } from 'lucide-react';

export default function TransportScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="my-trips" />
      <TripSubNav tripId={id} activeTab="transport" />

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
                <Navigation color="var(--primary)" size={28} />
                Transport Logistics & Connections
              </h1>
              <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Manage flights, trains, cars, and inter-city transit segments for your trip.
              </p>
            </div>
          </div>

          <TransportManager tripId={id} />
        </div>
      </main>
    </div>
  );
}
