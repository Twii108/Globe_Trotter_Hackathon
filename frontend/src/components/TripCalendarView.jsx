import React, { useState } from 'react';
import { Calendar as CalendarIcon, List, MapPin, Clock, DollarSign, Edit, Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import Button from './Button';

export default function TripCalendarView({ trip, onRemoveActivity, onEditActivity, onAddActivityClick }) {
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'calendar' | 'grouped'
  const [expandedDays, setExpandedDays] = useState({});

  if (!trip) return null;

  const stops = trip.stops || [];
  const durationDays = trip.durationDays || 7;
  const startDateObj = trip.startDate ? new Date(trip.startDate) : new Date();

  // Generate days array
  const days = Array.from({ length: durationDays }).map((_, idx) => {
    const d = new Date(startDateObj);
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'short' }).toUpperCase();

    // Find active stop for this date
    const stopForDay = stops.find(s => {
      if (!s.startDate || !s.endDate) return false;
      return dateStr >= s.startDate && dateStr <= s.endDate;
    }) || stops[Math.min(idx, stops.length - 1)];

    // Gather activities for this day
    const dayActivities = (stopForDay?.activities || []).filter(a => {
      if (a.date) return a.date === dateStr;
      return true; // fallback
    });

    const dayTotalCost = dayActivities.reduce((sum, a) => sum + Number(a.cost || a.estimatedCost || 0), 0);

    return {
      dayIndex: idx + 1,
      dateStr,
      formattedDate,
      cityName: stopForDay?.city || 'Unscheduled Stop',
      stopId: stopForDay?.id,
      activities: dayActivities,
      totalCost: dayTotalCost
    };
  });

  const toggleDayExpand = (dayIdx) => {
    setExpandedDays(prev => ({ ...prev, [dayIdx]: !prev[dayIdx] }));
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* View Switcher Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--neutral-bg)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('timeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'timeline' ? 'var(--surface)' : 'transparent',
              color: activeTab === 'timeline' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'timeline' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <List size={15} /> Timeline View
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'calendar' ? 'var(--surface)' : 'transparent',
              color: activeTab === 'calendar' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'calendar' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <CalendarIcon size={15} /> Calendar Grid
          </button>

          <button
            onClick={() => setActiveTab('grouped')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'grouped' ? 'var(--surface)' : 'transparent',
              color: activeTab === 'grouped' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'grouped' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <MapPin size={15} /> Grouped by City
          </button>
        </div>
      </div>

      {/* 1. TIMELINE DAY-WISE VIEW */}
      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {days.map((day) => (
            <div
              key={day.dayIndex}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}
            >
              {/* Day Header Bar */}
              <div
                onClick={() => toggleDayExpand(day.dayIndex)}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  background: 'var(--neutral-bg)',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', backgroundColor: 'var(--primary)', color: '#fff', padding: '3px 10px', borderRadius: '12px' }}>
                    DAY {day.dayIndex}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                    {day.formattedDate}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    • <MapPin size={13} color="var(--accent)" /> {day.cityName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Est: <span style={{ color: 'var(--accent)' }}>${day.totalCost}</span>
                  </span>
                  {expandedDays[day.dayIndex] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </div>

              {/* Day Activity List */}
              <div style={{ padding: '1rem 1.25rem' }}>
                {day.activities.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {day.activities.map((act) => (
                      <div
                        key={act.id}
                        style={{
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'var(--surface)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '4px 8px', borderRadius: '6px', minWidth: '70px', textAlign: 'center' }}>
                            <Clock size={12} style={{ marginRight: '3px' }} /> {act.time || '10:00 AM'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                              {act.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                              <span>Category: {act.category || 'Sightseeing'}</span>
                              <span>Duration: {act.duration || 1.5}h</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.9rem' }}>
                            ${act.cost || act.estimatedCost || 0}
                          </span>
                          {onRemoveActivity && (
                            <button
                              onClick={() => onRemoveActivity(day.stopId, act.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                              title="Delete Activity"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No scheduled activities for Day {day.dayIndex}.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. CALENDAR GRID VIEW */}
      {activeTab === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {days.map((day) => (
            <div
              key={day.dayIndex}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                padding: '1rem',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--primary)' }}>
                    DAY {day.dayIndex}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {day.formattedDate}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  📍 {day.cityName}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {day.activities.slice(0, 3).map(a => (
                    <div key={a.id} style={{ fontSize: '0.75rem', background: 'var(--neutral-bg)', padding: '3px 6px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      🕒 {a.time} - {a.name}
                    </div>
                  ))}
                  {day.activities.length > 3 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                      +{day.activities.length - 3} more activities
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{day.activities.length} items</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${day.totalCost}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. GROUPED BY CITY VIEW */}
      {activeTab === 'grouped' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {stops.map((stop, idx) => (
            <div
              key={stop.id || idx}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={18} color="var(--accent)" /> City {idx + 1}: {stop.city}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Dates: {stop.startDate || 'TBD'} ➔ {stop.endDate || 'TBD'}
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', background: 'var(--neutral-bg)', padding: '4px 10px', borderRadius: '12px' }}>
                  {stop.activities ? stop.activities.length : 0} Activities
                </span>
              </div>

              {stop.activities && stop.activities.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                  {stop.activities.map(act => (
                    <div key={act.id} style={{ padding: '0.75rem', background: 'var(--neutral-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{act.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🕒 {act.time || '10:00 AM'}</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${act.cost || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activities planned for {stop.city} yet.</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
