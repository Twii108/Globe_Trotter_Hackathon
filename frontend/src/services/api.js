// Mock API service for GlobeTrotter Frontend
// Components interact ONLY through this service layer.

const MOCK_USER = {
  id: 'usr_101',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  preferredCurrency: 'USD'
};

const INITIAL_TRIPS = [
  {
    id: 'trip_1',
    name: 'Japan Autumn Discovery',
    destination: 'Kyoto & Tokyo, Japan',
    country: 'Japan',
    startDate: '2026-09-15',
    endDate: '2026-09-28',
    description: 'Immerse in ancient shrines in Kyoto and neon cityscape in Tokyo during the autumn foliage season.',
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
        startDate: '2026-09-15',
        endDate: '2026-09-20',
        activities: [
          { id: 'act_1', name: 'Fushimi Inari Torii Gate Walk', time: '08:30 AM', cost: 0, dayNumber: 1, date: '2026-09-15' },
          { id: 'act_2', name: 'Gion Traditional Tea Ceremony', time: '02:00 PM', cost: 60, dayNumber: 1, date: '2026-09-15' },
          { id: 'act_3', name: 'Arashiyama Bamboo Forest Exploration', time: '09:30 AM', cost: 15, dayNumber: 2, date: '2026-09-16' },
          { id: 'act_4', name: 'Kinkaku-ji (Golden Pavilion) Visit', time: '01:30 PM', cost: 10, dayNumber: 3, date: '2026-09-17' }
        ]
      },
      {
        id: 'stop_2',
        city: 'Tokyo',
        startDate: '2026-09-21',
        endDate: '2026-09-28',
        activities: [
          { id: 'act_5', name: 'Shibuya Crossing & Observation Deck', time: '10:00 AM', cost: 25, dayNumber: 7, date: '2026-09-21' },
          { id: 'act_6', name: 'Tsukiji Outer Market Food Tour', time: '08:30 AM', cost: 75, dayNumber: 8, date: '2026-09-22' },
          { id: 'act_7', name: 'Akihabara Tech & Anime Stroll', time: '03:00 PM', cost: 40, dayNumber: 9, date: '2026-09-23' }
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
        startDate: '2026-11-04',
        endDate: '2026-11-08',
        activities: [
          { id: 'act_8', name: 'Path of the Gods Scenic Hike', time: '09:00 AM', cost: 0, dayNumber: 1, date: '2026-11-04' },
          { id: 'act_9', name: 'Sunset Mediterranean Boat Cruise', time: '05:00 PM', cost: 120, dayNumber: 2, date: '2026-11-05' }
        ]
      },
      {
        id: 'stop_4',
        city: 'Ravello',
        startDate: '2026-11-09',
        endDate: '2026-11-12',
        activities: [
          { id: 'act_10', name: 'Villa Cimbrone Infinity Terrace Walk', time: '11:00 AM', cost: 12, dayNumber: 6, date: '2026-11-09' }
        ]
      }
    ]
  }
];

const RECOMMENDED_DESTINATIONS = [
  {
    id: 'rec_1',
    title: 'Santorini Sunset Experience',
    location: 'Greece',
    rating: 4.9,
    reviewsCount: 328,
    estimatedCost: 1800,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    category: 'Romantic'
  },
  {
    id: 'rec_2',
    title: 'Swiss Alps Hiking Adventure',
    location: 'Switzerland',
    rating: 4.8,
    reviewsCount: 215,
    estimatedCost: 2400,
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    category: 'Adventure'
  },
  {
    id: 'rec_3',
    title: 'Bali Island Hopping',
    location: 'Indonesia',
    rating: 4.7,
    reviewsCount: 450,
    estimatedCost: 1200,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    category: 'Tropical'
  },
  {
    id: 'rec_4',
    title: 'Reykjavik Northern Lights',
    location: 'Iceland',
    rating: 4.9,
    reviewsCount: 189,
    estimatedCost: 2100,
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    category: 'Nature'
  }
];

let currentTripsList = [...INITIAL_TRIPS];
let currentUserSession = MOCK_USER;

// Utility delay function for realistic mock API responses
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Calculate duration in days between two date strings
const calculateDuration = (start, end) => {
  if (!start || !end) return 7;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

// MANDATORY API PLACEHOLDER FUNCTIONS FOR MEMBER 1 / MEMBER 2 API CONTRACT:

export const getTrips = async () => {
  await delay(300);
  return [...currentTripsList];
};

export const getTrip = async (id) => {
  await delay(250);
  const trip = currentTripsList.find(t => String(t.id) === String(id));
  if (!trip) {
    throw new Error(`Trip with ID ${id} not found.`);
  }
  return { ...trip };
};

export const createTrip = async (tripData) => {
  await delay(400);
  const duration = calculateDuration(tripData.startDate, tripData.endDate);
  const newTrip = {
    id: `trip_${Date.now()}`,
    name: tripData.name || tripData.destination || 'New Adventure',
    destination: tripData.destination || tripData.name || 'Global Destination',
    country: tripData.country || 'International',
    startDate: tripData.startDate || new Date().toISOString().split('T')[0],
    endDate: tripData.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    description: tripData.description || 'Custom planned trip itinerary on GlobeTrotter.',
    durationDays: duration,
    status: tripData.status || 'Planning',
    budget: Number(tripData.budget) || 2000,
    spent: Number(tripData.spent) || 0,
    coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    tags: tripData.tags || ['Vacation', 'Adventure'],
    stops: tripData.stops || [
      {
        id: `stop_${Date.now()}_1`,
        city: tripData.destination ? tripData.destination.split(',')[0] : 'Main Destination',
        startDate: tripData.startDate || new Date().toISOString().split('T')[0],
        endDate: tripData.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        activities: []
      }
    ]
  };
  currentTripsList.unshift(newTrip);
  return newTrip;
};

export const updateTrip = async (id, tripData) => {
  await delay(350);
  const index = currentTripsList.findIndex(t => String(t.id) === String(id));
  if (index === -1) {
    throw new Error(`Trip with ID ${id} not found.`);
  }

  const updatedTrip = {
    ...currentTripsList[index],
    ...tripData,
    durationDays: calculateDuration(
      tripData.startDate || currentTripsList[index].startDate,
      tripData.endDate || currentTripsList[index].endDate
    )
  };
  currentTripsList[index] = updatedTrip;
  return { ...updatedTrip };
};

export const deleteTrip = async (id) => {
  await delay(300);
  currentTripsList = currentTripsList.filter(t => String(t.id) !== String(id));
  return true;
};

export const addStop = async (tripId, stopData) => {
  await delay(300);
  const trip = currentTripsList.find(t => String(t.id) === String(tripId));
  if (!trip) {
    throw new Error(`Trip with ID ${tripId} not found.`);
  }
  if (!trip.stops) trip.stops = [];

  const newStop = {
    id: `stop_${Date.now()}`,
    city: stopData.city || 'New City Stop',
    startDate: stopData.startDate || trip.startDate,
    endDate: stopData.endDate || trip.endDate,
    activities: stopData.activities || []
  };

  trip.stops.push(newStop);
  return { trip, stop: newStop };
};

export const addActivity = async (tripId, stopId, activityData) => {
  await delay(300);
  const trip = currentTripsList.find(t => String(t.id) === String(tripId));
  if (!trip) {
    throw new Error(`Trip with ID ${tripId} not found.`);
  }

  const stop = trip.stops?.find(s => String(s.id) === String(stopId));
  if (!stop) {
    throw new Error(`Stop with ID ${stopId} not found in trip.`);
  }
  if (!stop.activities) stop.activities = [];

  const newActivity = {
    id: `act_${Date.now()}`,
    name: activityData.name || 'New Activity',
    time: activityData.time || '10:00 AM',
    cost: Number(activityData.cost) || 0,
    dayNumber: Number(activityData.dayNumber) || 1,
    date: activityData.date || stop.startDate
  };

  stop.activities.push(newActivity);
  return { trip, activity: newActivity };
};

export const removeActivity = async (tripId, stopId, activityId) => {
  await delay(250);
  const trip = currentTripsList.find(t => String(t.id) === String(tripId));
  if (!trip) return null;
  const stop = trip.stops?.find(s => String(s.id) === String(stopId));
  if (!stop) return null;

  stop.activities = stop.activities.filter(a => String(a.id) !== String(activityId));
  return { ...trip };
};

export const deleteStop = async (tripId, stopId) => {
  await delay(250);
  const trip = currentTripsList.find(t => String(t.id) === String(tripId));
  if (!trip) return null;
  trip.stops = trip.stops.filter(s => String(s.id) !== String(stopId));
  return { ...trip };
};

export const reorderStops = async (tripId, updatedStops) => {
  await delay(250);
  const trip = currentTripsList.find(t => String(t.id) === String(tripId));
  if (!trip) return null;
  trip.stops = updatedStops;
  return { ...trip };
};

// Auth & Trip services bundle
export const authService = {
  async login(email, password) {
    await delay(400);
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    currentUserSession = { ...MOCK_USER, email };
    return {
      user: currentUserSession,
      token: 'mock_jwt_token_globetrotter_12345'
    };
  },

  async signup({ name, email, password }) {
    await delay(400);
    if (!name || !email || !password) {
      throw new Error('All fields are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    currentUserSession = {
      id: `usr_${Date.now()}`,
      name,
      email,
      avatar: MOCK_USER.avatar,
      preferredCurrency: 'USD'
    };
    return {
      user: currentUserSession,
      token: 'mock_jwt_token_globetrotter_67890'
    };
  },

  async getCurrentUser() {
    await delay(150);
    return currentUserSession;
  },

  async logout() {
    await delay(150);
    currentUserSession = null;
    return true;
  }
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

  async getRecommendedDestinations() {
    await delay(250);
    return [...RECOMMENDED_DESTINATIONS];
  },

  async getBudgetSummary() {
    await delay(250);
    const totalBudget = currentTripsList.reduce((acc, t) => acc + (t.budget || 0), 0);
    const totalSpent = currentTripsList.reduce((acc, t) => acc + (t.spent || 0), 0);
    return {
      totalBudget: totalBudget || 0,
      totalSpent: totalSpent || 0,
      remaining: Math.max(0, totalBudget - totalSpent),
      currency: '$'
    };
  },

  async clearTrips() {
    await delay(200);
    currentTripsList = [];
    return true;
  },

  async restoreDefaultTrips() {
    await delay(200);
    currentTripsList = [...INITIAL_TRIPS];
    return [...currentTripsList];
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
  reorderStops
};

