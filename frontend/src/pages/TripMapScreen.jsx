import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TripSubNav from '../components/TripSubNav';
import TripMap from '../components/TripMap';
import Button from '../components/Button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { getTrip } from '../services/api';
import toast from 'react-hot-toast';

export default function TripMapScreen() {
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
      toast.error('Failed to load map data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="my-trips" />
      <TripSubNav tripId={id} activeTab="map" />

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
                <MapPin color="var(--primary)" size={28} />
                Interactive Route Map
              </h1>
              <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Visualizing sequence of stops and mapped destination activities.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading interactive map...
            </div>
          ) : trip ? (
            <TripMap trip={trip} />
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Trip details unavailable.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
