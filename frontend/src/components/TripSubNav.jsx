import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Layout, Calendar, MapPin, DollarSign, Navigation, Activity, Share2, Eye } from 'lucide-react';

export default function TripSubNav({ tripId, activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const id = tripId || params.id;

  const navItems = [
    { key: 'overview', label: 'Overview', icon: <Eye size={16} />, path: `/trips/${id}/view` },
    { key: 'builder', label: 'Itinerary', icon: <Layout size={16} />, path: `/trips/${id}/builder` },
    { key: 'timeline', label: 'Timeline', icon: <Calendar size={16} />, path: `/trips/${id}/timeline` },
    { key: 'map', label: 'Map', icon: <MapPin size={16} />, path: `/trips/${id}/map` },
    { key: 'budget', label: 'Budget', icon: <DollarSign size={16} />, path: `/trips/${id}/budget` },
    { key: 'transport', label: 'Transport', icon: <Navigation size={16} />, path: `/trips/${id}/transport` },
    { key: 'health', label: 'Trip Health', icon: <Activity size={16} />, path: `/trips/${id}/health` },
    { key: 'share', label: 'Share', icon: <Share2 size={16} />, path: `/trips/${id}/share` },
  ];

  const currentTab = activeTab || navItems.find(item => location.pathname === item.path || location.pathname.startsWith(item.path))?.key || 'builder';

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 1rem',
      marginBottom: '1.5rem',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '0.5rem'
      }}>
        {navItems.map((item) => {
          const isActive = currentTab === item.key || location.pathname === item.path;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.85rem 1rem',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
