import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { Search, MapPin, DollarSign, Star, Plus, Heart, Filter, Compass } from 'lucide-react';
import { searchCities, getTrips, addStop, toggleSaveCity } from '../services/api';
import '../styles/dashboard.css';

export default function CitySearch() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [maxCostIndex, setMaxCostIndex] = useState(10);

  // Add to Trip Modal
  const [selectedCity, setSelectedCity] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCities();
    loadUserTrips();
  }, []);

  const loadCities = async () => {
    setLoading(true);
    try {
      const data = await searchCities('');
      setCities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTrips = async () => {
    try {
      const trips = await getTrips();
      setUserTrips(trips);
      if (trips.length > 0) setSelectedTripId(trips[0].id);
    } catch (err) { }
  };

  const handleToggleHeart = async (cityId, e) => {
    e.stopPropagation();
    const newStatus = await toggleSaveCity(cityId);
    setCities(cities.map(c => String(c.id) === String(cityId) ? { ...c, isSaved: newStatus } : c));
  };

  const handleOpenAddModal = (city) => {
    setSelectedCity(city);
    setIsAddModalOpen(true);
  };

  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTripId) {
      alert('Please select a trip.');
      return;
    }
    setSubmitting(true);
    try {
      await addStop(selectedTripId, {
        city: selectedCity.name,
        cityId: selectedCity.id,
        startDate: startDate,
        endDate: endDate
      });
      alert(`Added ${selectedCity.name} to trip!`);
      setIsAddModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to add stop.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCities = cities.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
    const matchesCost = c.costIndex <= maxCostIndex;

    return matchesSearch && matchesRegion && matchesCost;
  });

  return (
    <div className="dashboard-layout">
      <Navbar activeTab="cities" />

      <main className="dashboard-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            City & Destination Discovery
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Explore top destinations, check cost ratings, save favorites to profile, and add stops to your itineraries.
          </p>
        </div>

        {/* Search & Multi-Filter Toolbar */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ flex: '1 1 300px' }}>
            <Input
              icon={<Search size={18} />}
              placeholder="Search by city name, country, region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <Filter size={15} /> Region:
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <option value="All">All Regions</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
                <option value="Middle East">Middle East</option>
              </select>
            </div>
          </div>
        </div>

        {/* City Cards Grid */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading destination database...</div>
        ) : filteredCities.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredCities.map((city) => (
              <div
                key={city.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  position: 'relative'
                }}
              >
                {/* Heart Save Button (#19 in prompt) */}
                <button
                  onClick={(e) => handleToggleHeart(city.id, e)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    zIndex: 2
                  }}
                  title={city.isSaved ? 'Unsave Destination' : 'Save Destination'}
                >
                  <Heart size={18} color={city.isSaved ? '#ef4444' : '#64748b'} fill={city.isSaved ? '#ef4444' : 'none'} />
                </button>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', tracking: '0.5px' }}>
                    {city.region}
                  </div>
                  <h3 style={{ margin: '0.2rem 0 0.2rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {city.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    📍 {city.country}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {city.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', padding: '0.6rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                    <span>Cost Index: <strong>{'$'.repeat(Math.min(3, Math.ceil(city.costIndex / 3)))}</strong></span>
                    <span>★ <strong>{(city.popularity / 20).toFixed(1)}</strong></span>
                  </div>

                  <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => handleOpenAddModal(city)}>
                    Add to Trip
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No cities found matching your criteria.</div>
        )}

        {/* Add to Trip Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={`Add ${selectedCity?.name} to Itinerary`}>
          <form onSubmit={handleAddStopSubmit}>
            <div className="input-group">
              <label className="input-label">Select Destination Trip *</label>
              <select
                className="input-field"
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                required
              >
                {userTrips.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.startDate})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Stop Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input label="Stop End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={submitting}>Add Stop</Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
