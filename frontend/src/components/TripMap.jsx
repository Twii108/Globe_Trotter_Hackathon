import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon bug in React builds
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// A helper component to auto-pan and zoom the map to fit all stops
function MapBoundsController({ stops }) {
  const map = useMap();
  
  useEffect(() => {
    if (!stops || stops.length === 0) return;
    const validStops = stops.filter(s => s.lat !== null && s.lng !== null);
    if (validStops.length === 0) return;
    
    const bounds = validStops.map(s => [s.lat, s.lng]);
    if (bounds.length === 1) {
      map.setView(bounds[0], 6);
    } else {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [stops, map]);

  return null;
}

export default function TripMap({ trip }) {
  const stops = trip?.stops || [];
  const validStops = stops.filter(s => s.lat !== null && s.lng !== null);
  const positions = validStops.map(s => [s.lat, s.lng]);

  const defaultCenter = [20, 0];
  const defaultZoom = 2;

  // Custom numbered marker icons for stops
  const createNumberedIcon = (number) => {
    return L.divIcon({
      className: 'custom-numbered-marker',
      html: `<div style="
        background-color: var(--primary);
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.8rem;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${number}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        padding: '1rem 1.25rem', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Interactive Travel Route
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {validStops.length} mapped stops
        </span>
      </div>

      <div style={{ height: '380px', width: '100%', position: 'relative', zIndex: 1 }}>
        <MapContainer 
          center={positions.length > 0 ? positions[0] : defaultCenter} 
          zoom={positions.length > 0 ? 5 : defaultZoom} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {validStops.map((stop, idx) => {
            // Find activities for this stop
            const stopActs = (trip.activities || []).filter(a => String(a.stopId || a.stop_id) === String(stop.id));

            return (
              <Marker 
                key={stop.id} 
                position={[stop.lat, stop.lng]} 
                icon={createNumberedIcon(idx + 1)}
              >
                <Popup>
                  <div style={{ minWidth: '160px', fontFamily: 'Inter, sans-serif' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Stop ${idx + 1}: {stop.city}
                    </h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {stop.startDate} ➔ {stop.endDate}
                    </p>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                        Planned Activities:
                      </span>
                      {stopActs.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '0.725rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {stopActs.map((act) => (
                            <li key={act.id}>{act.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No activities added yet
                        </span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {positions.length > 1 && (
            <Polyline 
              positions={positions} 
              color="var(--primary)" 
              weight={3} 
              dashArray="6, 8" 
            />
          )}

          <MapBoundsController stops={stops} />
        </MapContainer>
      </div>
    </div>
  );
}
