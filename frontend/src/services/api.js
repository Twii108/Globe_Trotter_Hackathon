// API Service Layer for GlobeTrotter Frontend
// Connects to Backend (http://localhost:5000/api) with intelligent local fallback.

const BASE_URL = 'http://localhost:5000/api';

const getStoredToken = () => localStorage.getItem('globetrotter_token') || '';
const setStoredToken = (token) => localStorage.setItem('globetrotter_token', token);
const removeStoredToken = () => localStorage.removeItem('globetrotter_token');

const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Seed dataset for Cities fallback
const SEED_CITIES = [
  { id: 'c1', name: 'Paris', country: 'France', region: 'Europe', costIndex: 8, popularity: 95, description: 'The City of Light, famous for its cafe culture and the Eiffel Tower.' },
  { id: 'c2', name: 'Kyoto', country: 'Japan', region: 'Asia', costIndex: 7, popularity: 90, description: 'Former imperial capital known for classical Buddhist temples and gardens.' },
  { id: 'c3', name: 'New York City', country: 'USA', region: 'North America', costIndex: 9, popularity: 98, description: 'The Big Apple, a global hub of finance, culture, and entertainment.' },
  { id: 'c4', name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 4, popularity: 92, description: 'Indonesian island known for its forested volcanic mountains and beaches.' },
  { id: 'c5', name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 7, popularity: 94, description: 'Capital of Italy, known for nearly 3,000 years of globally influential art.' },
  { id: 'c6', name: 'Cape Town', country: 'South Africa', region: 'Africa', costIndex: 5, popularity: 85, description: 'A port city on South Africa\'s southwest coast, beneath Table Mountain.' },
  { id: 'c7', name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', costIndex: 6, popularity: 88, description: 'Huge seaside city in Brazil, famed for its Copacabana and Ipanema beaches.' },
  { id: 'c8', name: 'Sydney', country: 'Australia', region: 'Oceania', costIndex: 8, popularity: 89, description: 'Capital of New South Wales, best known for its harbourfront Opera House.' },
  { id: 'c9', name: 'Dubai', country: 'UAE', region: 'Middle East', costIndex: 9, popularity: 91, description: 'City and emirate known for luxury shopping, ultramodern architecture.' },
  { id: 'c10', name: 'Machu Picchu', country: 'Peru', region: 'South America', costIndex: 5, popularity: 87, description: 'Incan citadel set high in the Andes Mountains in Peru.' },
  { id: 'c11', name: 'Santorini', country: 'Greece', region: 'Europe', costIndex: 7, popularity: 89, description: 'One of the Cyclades islands in the Aegean Sea, known for white cubiform houses.' },
  { id: 'c12', name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 4, popularity: 93, description: 'Thailand\'s capital, known for ornate shrines and vibrant street life.' }
];

// Seed dataset for Activities fallback
const SEED_ACTIVITIES = [
  { id: 'a1', cityId: 'c1', cityName: 'Paris', name: 'Eiffel Tower Tour', category: 'Sightseeing', description: 'Ascend the iconic tower for panoramic views of Paris.', duration: 2.5, cost: 30, estimatedCost: 30 },
  { id: 'a2', cityId: 'c1', cityName: 'Paris', name: 'Louvre Museum Tour', category: 'Culture', description: 'See the Mona Lisa and thousands of masterworks.', duration: 4, cost: 20, estimatedCost: 20 },
  { id: 'a3', cityId: 'c2', cityName: 'Kyoto', name: 'Arashiyama Bamboo Grove Walk', category: 'Nature', description: 'Walk through the serene bamboo forest in Kyoto.', duration: 2, cost: 0, estimatedCost: 0 },
  { id: 'a4', cityId: 'c4', cityName: 'Bali', name: 'Ubud Market & Craft Shopping', category: 'Shopping', description: 'Shop for local crafts, textiles, and spices in Ubud.', duration: 3, cost: 50, estimatedCost: 50 },
  { id: 'a5', cityId: 'c7', cityName: 'Rio de Janeiro', name: 'Hang Gliding over Rio', category: 'Adventure', description: 'Thrill ride with views of Sugarloaf Mountain.', duration: 1.5, cost: 150, estimatedCost: 150 },
  { id: 'a6', cityId: 'c12', cityName: 'Bangkok', name: 'Authentic Street Food Tour', category: 'Food', description: 'Taste authentic Pad Thai and local night market delicacies.', duration: 3, cost: 25, estimatedCost: 25 },
  { id: 'a7', cityId: 'c10', cityName: 'Machu Picchu', name: 'Inca Trail Day Hike', category: 'Adventure', description: 'Hike historic trails leading to the ancient ruins.', duration: 8, cost: 80, estimatedCost: 80 },
  { id: 'a8', cityId: 'c3', cityName: 'New York City', name: 'Broadway Show & Times Square', category: 'Culture', description: 'Enjoy a world-class theatrical performance in NYC.', duration: 3, cost: 120, estimatedCost: 120 },
  { id: 'a9', cityId: 'c9', cityName: 'Dubai', name: 'Dubai Mall & Burj Khalifa Deck', category: 'Shopping', description: 'Explore luxury shopping and the tallest deck in the world.', duration: 5, cost: 200, estimatedCost: 200 }
];

const INITIAL_TRIPS = [
  {
    id: 'trip_1',
    name: 'Japan Autumn Discovery',
    destination: 'Kyoto & Tokyo, Japan',
    country: 'Japan',
    startDate: '2026-09-15',
    endDate: '2026-09-28',
    description: 'Immerse in ancient shrines in Kyoto and neon cityscape in Tokyo during autumn.',
    durationDays: 14,
    status: 'Upcoming',
    budget: 3500,
    spent: 1200,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    tags: ['Culture', 'Food', 'Temples'],
    stops: [
      {
        id: 'stop_1',
        city: 'Kyoto',
        cityId: 'c2',
        startDate: '2026-09-15',
        endDate: '2026-09-20',
        durationDays: 6,
        activities: [
          { id: 'act_1', name: 'Fushimi Inari Torii Gate Walk', time: '08:30 AM', cost: 0, estimatedCost: 0, dayNumber: 1, date: '2026-09-15' },
          { id: 'act_2', name: 'Gion Traditional Tea Ceremony', time: '02:00 PM', cost: 60, estimatedCost: 60, dayNumber: 1, date: '2026-09-15' },
          { id: 'act_3', name: 'Arashiyama Bamboo Forest Exploration', time: '09:30 AM', cost: 15, estimatedCost: 15, dayNumber: 2, date: '2026-09-16' }
        ]
      },
      {
        id: 'stop_2',
        city: 'Tokyo',
        cityId: 'c3',
        startDate: '2026-09-21',
        endDate: '2026-09-28',
        durationDays: 8,
        activities: [
          { id: 'act_5', name: 'Shibuya Crossing & Observation Deck', time: '10:00 AM', cost: 25, estimatedCost: 25, dayNumber: 7, date: '2026-09-21' },
          { id: 'act_6', name: 'Tsukiji Outer Market Food Tour', time: '08:30 AM', cost: 75, estimatedCost: 75, dayNumber: 8, date: '2026-09-22' }
        ]
      }
    ]
  },
  {
    id: 'trip_2',
    name: 'Amalfi Coastal Dream',
    destination: 'Amalfi Coast, Italy',
    country: 'Italy',
    startDate: '2026-11-04',
    endDate: '2026-11-12',
    description: 'Dramatic cliffs, lemon groves, and romantic cliffside villages in Positano and Ravello.',
    durationDays: 8,
    status: 'Planning',
    budget: 2800,
    spent: 650,
    coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    tags: ['Coastal', 'Scenic', 'Wine'],
    stops: [
      {
        id: 'stop_3',
        city: 'Positano',
        cityId: 'c5',
        startDate: '2026-11-04',
        endDate: '2026-11-08',
        durationDays: 5,
        activities: [
          { id: 'act_8', name: 'Path of the Gods Scenic Hike', time: '09:00 AM', cost: 0, estimatedCost: 0, dayNumber: 1, date: '2026-11-04' },
          { id: 'act_9', name: 'Sunset Mediterranean Boat Cruise', time: '05:00 PM', cost: 120, estimatedCost: 120, dayNumber: 2, date: '2026-11-05' }
        ]
      }
    ]
  }
];

let localTripsStore = [...INITIAL_TRIPS];
let currentUserSession = {
  id: 'usr_101',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  preferredCurrency: 'USD',
  travelStyle: 'Balanced Explorer'
};

// Helper: safe fetch wrapper
async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

// AUTH API
export const authService = {
  async login(email, password) {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.data && res.data.token) {
        setStoredToken(res.data.token);
      }
      currentUserSession = res.data?.user || currentUserSession;
      return res.data;
    } catch (err) {
      console.warn('Backend login unavailable, using local session fallback:', err.message);
      if (!email || !password) throw new Error('Email and password required.');
      currentUserSession = { ...currentUserSession, email };
      return { user: currentUserSession, token: 'mock_jwt_token_123' };
    }
  },

  async signup({ name, email, password }) {
    try {
      const res = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      if (res.data && res.data.token) {
        setStoredToken(res.data.token);
      }
      currentUserSession = res.data?.user || currentUserSession;
      return res.data;
    } catch (err) {
      console.warn('Backend signup unavailable, using local session fallback:', err.message);
      if (!name || !email || !password) throw new Error('All fields required.');
      currentUserSession = { id: `usr_${Date.now()}`, name, email, avatar: currentUserSession.avatar, preferredCurrency: 'USD' };
      return { user: currentUserSession, token: 'mock_jwt_token_456' };
    }
  },

  async getCurrentUser() {
    try {
      const res = await apiFetch('/auth/me');
      currentUserSession = res.data?.user || currentUserSession;
      return currentUserSession;
    } catch (err) {
      return currentUserSession;
    }
  },

  async updateProfile(profileData) {
    currentUserSession = {
      ...currentUserSession,
      ...profileData
    };
    return currentUserSession;
  },

  async logout() {
    removeStoredToken();
    return true;
  }
};

// TRIPS API
export const getTrips = async () => {
  try {
    const res = await apiFetch('/trips');
    const remoteTrips = res.data || [];
    if (remoteTrips.length > 0) return remoteTrips;
    return [...localTripsStore];
  } catch (err) {
    return [...localTripsStore];
  }
};

export const getTrip = async (id) => {
  try {
    const res = await apiFetch(`/trips/${id}`);
    if (res.data) return res.data;
  } catch (err) {
    // fallback
  }
  const trip = localTripsStore.find(t => String(t.id) === String(id));
  if (!trip) throw new Error(`Trip ${id} not found.`);
  return { ...trip };
};

export const createTrip = async (tripData) => {
  try {
    const res = await apiFetch('/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: tripData.name || tripData.destination,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        cover_image: tripData.coverImage
      })
    });
    if (res.data) {
      const newTrip = {
        ...res.data,
        id: String(res.data.id),
        startDate: res.data.start_date || tripData.startDate,
        endDate: res.data.end_date || tripData.endDate,
        budget: Number(tripData.budget) || 2500,
        stops: tripData.stops || [
          {
            id: `stop_${Date.now()}`,
            city: tripData.destination ? tripData.destination.split(',')[0] : 'Main Stop',
            startDate: tripData.startDate,
            endDate: tripData.endDate,
            activities: []
          }
        ]
      };
      localTripsStore.unshift(newTrip);
      return newTrip;
    }
  } catch (err) {
    console.warn('Backend createTrip fallback:', err.message);
  }

  const newTrip = {
    id: `trip_${Date.now()}`,
    name: tripData.name || tripData.destination || 'New Trip',
    destination: tripData.destination || tripData.name || 'Global',
    country: tripData.country || 'International',
    startDate: tripData.startDate || new Date().toISOString().split('T')[0],
    endDate: tripData.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    description: tripData.description || 'Custom trip itinerary.',
    durationDays: 7,
    status: 'Planning',
    budget: Number(tripData.budget) || 2500,
    spent: 0,
    coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    tags: tripData.tags || ['Vacation'],
    stops: tripData.stops || [
      {
        id: `stop_${Date.now()}`,
        city: tripData.destination ? tripData.destination.split(',')[0] : 'Main City',
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        activities: []
      }
    ]
  };
  localTripsStore.unshift(newTrip);
  return newTrip;
};

export const updateTrip = async (id, tripData) => {
  try {
    await apiFetch(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: tripData.name,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        cover_image: tripData.coverImage
      })
    });
  } catch (err) {
    // fallback
  }
  const index = localTripsStore.findIndex(t => String(t.id) === String(id));
  if (index !== -1) {
    localTripsStore[index] = { ...localTripsStore[index], ...tripData };
    return { ...localTripsStore[index] };
  }
  return { id, ...tripData };
};

export const deleteTrip = async (id) => {
  try {
    await apiFetch(`/trips/${id}`, { method: 'DELETE' });
  } catch (err) {
    // fallback
  }
  localTripsStore = localTripsStore.filter(t => String(t.id) !== String(id));
  return true;
};

// STOPS API
export const addStop = async (tripId, stopData) => {
  try {
    const res = await apiFetch(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: JSON.stringify({
        city_id: stopData.cityId || 1,
        city: stopData.city,
        start_date: stopData.startDate,
        end_date: stopData.endDate,
        position: stopData.position || 0
      })
    });
    if (res.data) {
      const trip = localTripsStore.find(t => String(t.id) === String(tripId));
      const newStop = {
        id: String(res.data.id || Date.now()),
        city: stopData.city,
        startDate: stopData.startDate,
        endDate: stopData.endDate,
        activities: []
      };
      if (trip) {
        if (!trip.stops) trip.stops = [];
        trip.stops.push(newStop);
      }
      return { trip, stop: newStop };
    }
  } catch (err) {
    console.warn('Backend addStop fallback:', err.message);
  }

  const trip = localTripsStore.find(t => String(t.id) === String(tripId));
  const newStop = {
    id: `stop_${Date.now()}`,
    city: stopData.city || 'New City',
    startDate: stopData.startDate || (trip ? trip.startDate : ''),
    endDate: stopData.endDate || (trip ? trip.endDate : ''),
    activities: []
  };
  if (trip) {
    if (!trip.stops) trip.stops = [];
    trip.stops.push(newStop);
  }
  return { trip, stop: newStop };
};

export const deleteStop = async (tripId, stopId) => {
  try {
    await apiFetch(`/stops/${stopId}`, { method: 'DELETE' });
  } catch (err) {
    // fallback
  }
  const trip = localTripsStore.find(t => String(t.id) === String(tripId));
  if (trip && trip.stops) {
    trip.stops = trip.stops.filter(s => String(s.id) !== String(stopId));
  }
  return trip;
};

export const reorderStops = async (tripId, updatedStops) => {
  const trip = localTripsStore.find(t => String(t.id) === String(tripId));
  if (trip) {
    trip.stops = updatedStops;
  }
  return trip;
};

// CITIES API
export const searchCities = async (query = '') => {
  try {
    const res = await apiFetch(`/cities/search?q=${encodeURIComponent(query)}`);
    if (res.data && res.data.length > 0) return res.data;
  } catch (err) {
    // fallback
  }
  const q = query.toLowerCase().trim();
  if (!q) return SEED_CITIES;
  return SEED_CITIES.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q) ||
    c.region.toLowerCase().includes(q)
  );
};

export const getCities = async () => {
  return searchCities('');
};

// ACTIVITIES API
export const searchActivities = async (params = {}) => {
  const { cityId, category, maxCost, searchQuery } = params;
  try {
    let qStr = [];
    if (cityId) qStr.push(`city_id=${cityId}`);
    if (category && category !== 'All') qStr.push(`category=${encodeURIComponent(category)}`);
    const res = await apiFetch(`/activities?${qStr.join('&')}`);
    if (res.data && res.data.length > 0) return res.data;
  } catch (err) {
    // fallback
  }

  let filtered = [...SEED_ACTIVITIES];
  if (category && category !== 'All') {
    filtered = filtered.filter(a => a.category?.toLowerCase() === category.toLowerCase());
  }
  if (maxCost !== undefined && maxCost !== null && maxCost !== '') {
    filtered = filtered.filter(a => Number(a.cost || a.estimatedCost) <= Number(maxCost));
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || (a.cityName && a.cityName.toLowerCase().includes(q)));
  }
  return filtered;
};

export const addActivity = async (tripId, stopId, activityData) => {
  try {
    const res = await apiFetch(`/trips/${tripId}/activities`, {
      method: 'POST',
      body: JSON.stringify({
        activity_id: activityData.activityId || 1,
        stop_id: stopId,
        custom_name: activityData.name,
        scheduled_date: activityData.date,
        scheduled_time: activityData.time,
        cost: Number(activityData.cost) || 0
      })
    });
    if (res.data) {
      const trip = localTripsStore.find(t => String(t.id) === String(tripId));
      const stop = trip?.stops?.find(s => String(s.id) === String(stopId));
      const newAct = {
        id: String(res.data.id || Date.now()),
        name: activityData.name,
        time: activityData.time || '10:00 AM',
        cost: Number(activityData.cost) || 0,
        estimatedCost: Number(activityData.cost) || 0,
        dayNumber: Number(activityData.dayNumber) || 1,
        date: activityData.date
      };
      if (stop) {
        if (!stop.activities) stop.activities = [];
        stop.activities.push(newAct);
      }
      return { trip, activity: newAct };
    }
  } catch (err) {
    console.warn('Backend addActivity fallback:', err.message);
  }

  const trip = localTripsStore.find(t => String(t.id) === String(tripId));
  const stop = trip?.stops?.find(s => String(s.id) === String(stopId));
  const newAct = {
    id: `act_${Date.now()}`,
    name: activityData.name || 'New Activity',
    time: activityData.time || '10:00 AM',
    cost: Number(activityData.cost) || 0,
    estimatedCost: Number(activityData.cost) || 0,
    dayNumber: Number(activityData.dayNumber) || 1,
    date: activityData.date
  };
  if (stop) {
    if (!stop.activities) stop.activities = [];
    stop.activities.push(newAct);
  }
  return { trip, activity: newAct };
};

export const removeActivity = async (tripId, stopId, activityId) => {
  try {
    await apiFetch(`/trips/${tripId}/activities/${activityId}`, { method: 'DELETE' });
  } catch (err) {
    // fallback
  }
  const trip = localTripsStore.find(t => String(t.id) === String(tripId));
  const stop = trip?.stops?.find(s => String(s.id) === String(stopId));
  if (stop) {
    stop.activities = stop.activities.filter(a => String(a.id) !== String(activityId));
  }
  return trip;
};

// BUDGET CALCULATOR UTILITY
export const calculateTripBudget = (trip) => {
  const stops = trip.stops || [];
  let durationDays = trip.durationDays || 7;
  
  if (stops.length > 0) {
    const calculatedDays = stops.reduce((sum, s) => {
      const d1 = new Date(s.startDate);
      const d2 = new Date(s.endDate);
      const days = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      return sum + days;
    }, 0);
    if (calculatedDays > 0) durationDays = calculatedDays;
  }

  const transportCost = 300 + Math.max(0, stops.length - 1) * 120;
  const stayCost = durationDays * 95;
  const mealCost = durationDays * 45;

  const activityCost = stops.reduce((total, stop) => {
    return total + (stop.activities || []).reduce((aSum, act) => aSum + (Number(act.cost || act.estimatedCost) || 0), 0);
  }, 0);

  const totalCost = transportCost + stayCost + activityCost + mealCost;
  const userBudget = Number(trip.budget) || 2500;
  const remainingBudget = userBudget - totalCost;
  const isOverBudget = totalCost > userBudget;
  const avgDailyCost = Number((totalCost / Math.max(1, durationDays)).toFixed(2));

  return {
    transport: transportCost,
    stay: stayCost,
    activities: activityCost,
    meals: mealCost,
    total: totalCost,
    userBudget,
    remainingBudget,
    isOverBudget,
    avgDailyCost,
    durationDays
  };
};

export const tripService = {
  getUpcomingTrips: getTrips,
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  addStop,
  addActivity,
  removeActivity,
  deleteStop,
  reorderStops,
  searchCities,
  searchActivities,
  calculateTripBudget,

  async getRecommendedDestinations() {
    return SEED_CITIES.slice(0, 4).map(c => ({
      id: c.id,
      title: `${c.name} Discovery`,
      location: c.country,
      rating: (4.5 + (c.popularity % 5) * 0.1).toFixed(1),
      reviewsCount: c.popularity * 4,
      estimatedCost: c.costIndex * 220,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      category: c.region
    }));
  },

  async getBudgetSummary() {
    const totalBudget = localTripsStore.reduce((acc, t) => acc + (t.budget || 0), 0);
    const totalSpent = localTripsStore.reduce((acc, t) => acc + (t.spent || 1200), 0);
    return {
      totalBudget,
      totalSpent,
      remaining: Math.max(0, totalBudget - totalSpent),
      currency: '$'
    };
  },

  async clearTrips() {
    localTripsStore = [];
    return true;
  },

  async restoreDefaultTrips() {
    localTripsStore = [...INITIAL_TRIPS];
    return [...localTripsStore];
  }
};

export default {
  auth: authService,
  trips: tripService,
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  addStop,
  addActivity,
  removeActivity,
  deleteStop,
  reorderStops,
  searchCities,
  searchActivities,
  calculateTripBudget
};
