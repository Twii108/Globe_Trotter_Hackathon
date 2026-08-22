import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plane, Train, Bus, Car, Navigation, Plus, Trash2, Clock, DollarSign } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { getTransportSegments, addTransportSegment, deleteTransportSegment } from '../services/api';

const TRANSPORT_TYPES = [
  { label: 'Flight', icon: Plane },
  { label: 'Train', icon: Train },
  { label: 'Bus', icon: Bus },
  { label: 'Car / Drive', icon: Car },
  { label: 'Taxi', icon: Car },
  { label: 'Other', icon: Navigation }
];

export default function TransportManager({ tripId, stops = [], onTransportChange }) {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSegment, setNewSegment] = useState({
    mode: 'Flight',
    departureLocation: stops[0]?.city || '',
    arrivalLocation: stops[1]?.city || '',
    departureTime: '08:00 AM',
    arrivalTime: '11:00 AM',
    cost: '120'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSegments();
  }, [tripId]);

  const loadSegments = async () => {
    setLoading(true);
    try {
      const data = await getTransportSegments(tripId);
      setSegments(data);
      if (onTransportChange) onTransportChange(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await addTransportSegment(tripId, newSegment);
      const updated = [...segments, created];
      setSegments(updated);
      if (onTransportChange) onTransportChange(updated);
      toast.success('Transport segment added successfully!');
      setIsAddOpen(false);
      setNewSegment({
        mode: 'Flight',
        departureLocation: '',
        arrivalLocation: '',
        departureTime: '08:00 AM',
        arrivalTime: '11:00 AM',
        cost: '120'
      });
    } catch (err) {
      toast.error('Failed to add transport segment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (segmentId) => {
    await deleteTransportSegment(segmentId);
    const updated = segments.filter(s => String(s.id) !== String(segmentId));
    setSegments(updated);
    if (onTransportChange) onTransportChange(updated);
  };

  const getIconForMode = (mode) => {
    if (mode === 'Train') return <Train size={18} color="var(--primary)" />;
    if (mode === 'Bus') return <Bus size={18} color="var(--primary)" />;
    if (mode === 'Car / Drive' || mode === 'Taxi') return <Car size={18} color="var(--primary)" />;
    return <Plane size={18} color="var(--primary)" />;
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plane size={20} color="var(--primary)" /> Intercity Transport & Segments
          </h3>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Plan flights, trains, buses, and transfers between destination cities
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => setIsAddOpen(true)}
        >
          Add Transport
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading transport segments...
        </div>
      ) : segments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {segments.map((seg) => (
            <div
              key={seg.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getIconForMode(seg.mode)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    <span>{seg.departureLocation || 'Origin'}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>➔ {seg.mode} ➔</span>
                    <span>{seg.arrivalLocation || 'Destination'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {seg.departureTime && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> Dep: {seg.departureTime}
                      </span>
                    )}
                    {seg.arrivalTime && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> Arr: {seg.arrivalTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.95rem', background: 'rgba(234,88,12,0.1)', padding: '3px 10px', borderRadius: '12px' }}>
                  ${seg.cost || 0}
                </span>

                <button
                  onClick={() => handleDelete(seg.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                  title="Remove Segment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          No transport segments added. Click "+ Add Transport" above to log intercity flights or train transfers.
        </div>
      )}

      {/* Add Transport Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Intercity Transport Segment"
        maxWidth="520px"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="input-group">
            <label className="input-label">Transport Mode</label>
            <select
              value={newSegment.mode}
              onChange={(e) => setNewSegment({ ...newSegment, mode: e.target.value })}
              className="input-field"
            >
              {TRANSPORT_TYPES.map(t => (
                <option key={t.label} value={t.label}>{t.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Departure City / Station"
              value={newSegment.departureLocation}
              onChange={(e) => setNewSegment({ ...newSegment, departureLocation: e.target.value })}
              placeholder="e.g. Paris Charles de Gaulle"
              required
            />
            <Input
              label="Arrival City / Station"
              value={newSegment.arrivalLocation}
              onChange={(e) => setNewSegment({ ...newSegment, arrivalLocation: e.target.value })}
              placeholder="e.g. Rome Fiumicino"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Departure Time"
              value={newSegment.departureTime}
              onChange={(e) => setNewSegment({ ...newSegment, departureTime: e.target.value })}
              placeholder="e.g. 09:30 AM"
            />
            <Input
              label="Arrival Time"
              value={newSegment.arrivalTime}
              onChange={(e) => setNewSegment({ ...newSegment, arrivalTime: e.target.value })}
              placeholder="e.g. 11:45 AM"
            />
          </div>

          <Input
            label="Estimated Segment Cost ($)"
            type="number"
            value={newSegment.cost}
            onChange={(e) => setNewSegment({ ...newSegment, cost: e.target.value })}
            placeholder="e.g. 120"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Add Segment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
