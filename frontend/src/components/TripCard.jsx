import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Eye, Edit3, Trash2, Globe } from 'lucide-react';
import Card from './Card';
import Button from './Button';

export default function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();

  const stopCount = trip.stops ? trip.stops.length : 1;
  const tripName = trip.name || trip.destination || 'Untitled Trip';

  return (
    <Card
      image={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
      badge={trip.status || 'Planning'}
      title={tripName}
      footer={
        <div style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<Eye size={14} />}
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Edit3 size={14} />}
              onClick={() => navigate(`/trips/${trip.id}/builder`)}
            >
              Edit
            </Button>
          </div>
          <Button
            variant="text"
            size="sm"
            style={{ color: 'var(--danger)', padding: '0.4rem 0.6rem' }}
            icon={<Trash2 size={14} />}
            onClick={() => onDelete(trip.id)}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="trip-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
        <div className="trip-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Calendar size={14} />
          <span>{trip.startDate} to {trip.endDate}</span>
        </div>
        <div className="trip-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
          <MapPin size={14} color="var(--primary)" />
          <span>{trip.destination || trip.country} ({stopCount} {stopCount === 1 ? 'stop' : 'stops'})</span>
        </div>
      </div>

      {trip.description && (
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
          {trip.description}
        </p>
      )}

      {trip.tags && trip.tags.length > 0 && (
        <div className="trip-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {trip.tags.map((tag, idx) => (
            <span key={idx} className="tag-badge" style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
