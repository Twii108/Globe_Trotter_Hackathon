// GlobeTrotter Centralized API & Logic Engine
// Handles SQLite REST API Communication, Data Normalization, Central Budget Calculation,
// Conflict Detection, Health Score Engine, and Smart Recommendations.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'globetrotter_token';

// JWT Storage
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Central Fetch Client
async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body = null, requiresAuth = true, headers = {} } = options;

  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions = {
    method,
    headers: reqHeaders
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
  const data = await response.json().catch(() => null);

  if (!response.ok || (data && data.success === false)) {
    const errorMessage = data?.message || data?.error || `HTTP error ${response.status}`;
    const err = new Error(errorMessage);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// --- SEED FALLBACK DATASETS ---
const SEED_CITIES = [
  { id: '1', name: 'Paris', country: 'France', region: 'Europe', costIndex: 8, popularity: 95, description: 'The City of Light, famous for its cafe culture and the Eiffel Tower.' },
  { id: '2', name: 'Kyoto', country: 'Japan', region: 'Asia', costIndex: 7, popularity: 90, description: 'Former imperial capital known for classical Buddhist temples and gardens.' },
  { id: '3', name: 'New York City', country: 'USA', region: 'North America', costIndex: 9, popularity: 98, description: 'The Big Apple, a global hub of finance, culture, and entertainment.' },
  { id: '4', name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 4, popularity: 92, description: 'Indonesian island known for its forested volcanic mountains and beaches.' },
  { id: '5', name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 7, popularity: 94, description: 'Capital of Italy, known for nearly 3,000 years of globally influential art.' },
  { id: '6', name: 'Cape Town', country: 'South Africa', region: 'Africa', costIndex: 5, popularity: 85, description: 'A port city on South Africa\'s southwest coast, beneath Table Mountain.' },
  { id: '7', name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', costIndex: 6, popularity: 88, description: 'Huge seaside city in Brazil, famed for its Copacabana beaches.' },
  { id: '8', name: 'Sydney', country: 'Australia', region: 'Oceania', costIndex: 8, popularity: 89, description: 'Capital of New South Wales, best known for its harbourfront Opera House.' },
  { id: '9', name: 'Dubai', country: 'UAE', region: 'Middle East', costIndex: 9, popularity: 91, description: 'City and emirate known for luxury shopping, ultramodern architecture.' },
  { id: '10', name: 'Machu Picchu', country: 'Peru', region: 'South America', costIndex: 5, popularity: 87, description: 'Incan citadel set high in the Andes Mountains in Peru.' },
  { id: '11', name: 'Santorini', country: 'Greece', region: 'Europe', costIndex: 7, popularity: 89, description: 'Aegean sea island known for white cubiform houses.' },
  { id: '12', name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 4, popularity: 93, description: 'Thailand\'s capital, known for ornate shrines and street life.' }
];

const SEED_ACTIVITIES = [
  { id: '1', cityId: '1', cityName: 'Paris', name: 'Eiffel Tower Tour', category: 'Sightseeing', description: 'Ascend the iconic tower for panoramic views.', duration: 2.5, cost: 30, estimatedCost: 30 },
  { id: '2', cityId: '1', cityName: 'Paris', name: 'Louvre Museum', category: 'Culture', description: 'See the Mona Lisa and thousands of masterworks.', duration: 4.0, cost: 20, estimatedCost: 20 },
  { id: '3', cityId: '2', cityName: 'Kyoto', name: 'Arashiyama Bamboo Grove', category: 'Nature', description: 'Walk through the serene bamboo forest.', duration: 2.0, cost: 0, estimatedCost: 0 },
  { id: '4', cityId: '4', cityName: 'Bali', name: 'Ubud Market Shopping', category: 'Shopping', description: 'Shop for local crafts, textiles, and spices.', duration: 3.0, cost: 50, estimatedCost: 50 },
  { id: '5', cityId: '7', cityName: 'Rio de Janeiro', name: 'Hang Gliding over Rio', category: 'Adventure', description: 'Thrill ride with views of Sugarloaf Mountain.', duration: 1.5, cost: 150, estimatedCost: 150 },
  { id: '6', cityId: '12', cityName: 'Bangkok', name: 'Street Food Tour', category: 'Food', description: 'Taste authentic Pad Thai and local night market delicacies.', duration: 3.0, cost: 25, estimatedCost: 25 },
  { id: '7', cityId: '10', cityName: 'Machu Picchu', name: 'Inca Trail Hike', category: 'Adventure', description: 'Hike historic trails leading to the ancient ruins.', duration: 8.0, cost: 80, estimatedCost: 80 },
  { id: '8', cityId: '3', cityName: 'New York City', name: 'Broadway Show', category: 'Culture', description: 'Enjoy a world-class theatrical performance.', duration: 3.0, cost: 120, estimatedCost: 120 },
  { id: '9', cityId: '9', cityName: 'Dubai', name: 'Dubai Mall Experience', category: 'Shopping', description: 'Explore luxury shopping and the tallest deck in the world.', duration: 5.0, cost: 200, estimatedCost: 200 }
];

let localTripsStore = [
  {
    id: '1',
    name: 'Japan Autumn Discovery',
    destination: 'Kyoto & Tokyo, Japan',
    country: 'Japan',
    startDate: '2026-09-15',
    endDate: '2026-09-28',
    description: 'Immerse in ancient shrines in Kyoto and neon cityscape in Tokyo.',
    durationDays: 14,
    status: 'Upcoming',
    budget: 3500,
    spent: 1200,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    isPublic: true,
    shareId: 'sh_japan_demo',
    tags: ['Culture', 'Food', 'Temples'],
    stops: [
      {
        id: '1',
        city: 'Kyoto',
        cityId: '2',
        startDate: '2026-09-15',
        endDate: '2026-09-20',
        position: 0,
        activities: [
          { id: '1', name: 'Fushimi Inari Torii Gate Walk', time: '08:30 AM', cost: 0, estimatedCost: 0, dayNumber: 1, date: '2026-09-15' },
          { id: '2', name: 'Gion Traditional Tea Ceremony', time: '02:00 PM', cost: 60, estimatedCost: 60, dayNumber: 1, date: '2026-09-15' }
        ]
      },
      {
        id: '2',
        city: 'Tokyo',
        cityId: '3',
        startDate: '2026-09-21',
        endDate: '2026-09-28',
        position: 1,
        activities: [
          { id: '3', name: 'Shibuya Crossing & Observation Deck', time: '10:00 AM', cost: 25, estimatedCost: 25, dayNumber: 7, date: '2026-09-21' }
        ]
      }
    ]
  }
];

let localSavedCities = ['1', '2', '5'];
let currentUserSession = {
  id: 'usr_101',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  preferredCurrency: 'USD',
  travelStyle: 'Balanced Explorer'
};

// --- DATA NORMALIZERS ---

export const normalizeUser = (user) => {
  if (!user) return null;
  return {
    id: String(user.id),
    name: user.name || '',
    email: user.email || '',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    preferredCurrency: user.preferred_currency || user.preferredCurrency || 'USD',
    travelStyle: user.travel_style || user.travelStyle || 'Balanced Explorer',
    createdAt: user.created_at || user.createdAt
  };
};

export const normalizeActivity = (act) => {
  if (!act) return null;
  return {
    id: String(act.id),
    cityId: act.city_id || act.cityId ? String(act.city_id || act.cityId) : null,
    cityName: act.city_name || act.cityName || '',
    name: act.custom_name || act.name || act.activity_name || 'Activity',
    category: act.category || 'Sightseeing',
    description: act.description || '',
    duration: Number(act.duration) || 1.5,
    cost: Number(act.cost !== undefined ? act.cost : act.estimatedCost) || 0,
    estimatedCost: Number(act.cost !== undefined ? act.cost : act.estimatedCost) || 0,
    time: act.scheduled_time || act.time || '10:00 AM',
    date: act.scheduled_date || act.date || '',
    dayNumber: Number(act.dayNumber) || 1,
    location: act.location || ''
  };
};

export const normalizeStop = (stop) => {
  if (!stop) return null;
  return {
    id: String(stop.id),
    tripId: String(stop.trip_id || stop.tripId),
    cityId: stop.city_id || stop.cityId ? String(stop.city_id || stop.cityId) : null,
    city: stop.city || stop.city_name || 'City Stop',
    startDate: stop.start_date || stop.startDate || '',
    endDate: stop.end_date || stop.endDate || '',
    position: Number(stop.position) || 0,
    activities: Array.isArray(stop.activities) ? stop.activities.map(normalizeActivity) : []
  };
};

export const normalizeTrip = (trip) => {
  if (!trip) return null;
  const startDate = trip.start_date || trip.startDate || new Date().toISOString().split('T')[0];
  const endDate = trip.end_date || trip.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  let durationDays = 1;
  if (startDate && endDate) {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
      durationDays = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    }
  }

  // Calculate status from dates where possible
  const now = new Date().toISOString().split('T')[0];
  let calculatedStatus = 'Planning';
  if (startDate && endDate) {
    if (now >= startDate && now <= endDate) calculatedStatus = 'Ongoing';
    else if (now < startDate) calculatedStatus = 'Upcoming';
    else if (now > endDate) calculatedStatus = 'Completed';
  }

  return {
    id: String(trip.id),
    userId: String(trip.user_id || trip.userId || ''),
    name: trip.name || trip.title || trip.destination || 'New Adventure',
    destination: trip.destination || trip.name || 'Global Destination',
    country: trip.country || 'International',
    startDate,
    endDate,
    durationDays: Number(trip.durationDays) || durationDays,
    status: trip.status || calculatedStatus,
    description: trip.description || '',
    budget: Number(trip.budget) || 0,
    spent: Number(trip.spent) || 0,
    coverImage: trip.cover_image || trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    isPublic: Boolean(trip.is_public || trip.isPublic),
    shareId: trip.share_id || trip.shareId || null,
    createdAt: trip.created_at || trip.createdAt,
    tags: Array.isArray(trip.tags) ? trip.tags : (trip.tags ? String(trip.tags).split(',') : ['Vacation']),
    stops: Array.isArray(trip.stops) ? trip.stops.map(normalizeStop) : [],
    activities: Array.isArray(trip.activities) ? trip.activities.map(normalizeActivity) : []
  };
};

export const normalizeCity = (city) => {
  if (!city) return null;
  return {
    id: String(city.id),
    name: city.name || '',
    country: city.country || '',
    region: city.region || '',
    costIndex: Number(city.cost_index || city.costIndex) || 5,
    popularity: Number(city.popularity) || 80,
    description: city.description || '',
    isSaved: localSavedCities.includes(String(city.id))
  };
};

export const normalizeExpense = (expense) => {
  if (!expense) return null;
  return {
    id: String(expense.id),
    tripId: String(expense.trip_id || expense.tripId),
    category: expense.category || 'Miscellaneous',
    amount: Number(expense.amount) || 0,
    description: expense.description || '',
    expenseDate: expense.expense_date || expense.expenseDate || new Date().toISOString().split('T')[0]
  };
};

export const normalizeTransport = (t) => {
  if (!t) return null;
  return {
    id: String(t.id),
    tripId: String(t.trip_id || t.tripId),
    mode: t.mode || 'Flight',
    departureLocation: t.departure_location || t.departureLocation || '',
    arrivalLocation: t.arrival_location || t.arrivalLocation || '',
    departureTime: t.departure_time || t.departureTime || '',
    arrivalTime: t.arrival_time || t.arrivalTime || '',
    cost: Number(t.cost) || 0
  };
};

// --- CENTRALIZED BUDGET CALCULATION ENGINE ---
export const calculateTripBudget = (trip, expenses = [], transportSegments = []) => {
  if (!trip) {
    return {
      transport: 0, stay: 0, activities: 0, meals: 0, misc: 0,
      totalEstimated: 0, actualExpenses: 0, userBudget: 0,
      remainingBudget: 0, percentageUsed: 0, isOverBudget: false,
      avgDailyCost: 0, durationDays: 1, categoryTotals: {}
    };
  }

  const stops = trip.stops || [];
  let durationDays = trip.durationDays || 7;

  if (stops.length > 0) {
    const calculatedDays = stops.reduce((sum, s) => {
      const d1 = new Date(s.startDate);
      const d2 = new Date(s.endDate);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return sum + 1;
      const days = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      return sum + days;
    }, 0);
    if (calculatedDays > 0) durationDays = calculatedDays;
  }

  // Transport costs from transport segments or default estimation
  const transportCost = transportSegments.length > 0
    ? transportSegments.reduce((sum, t) => sum + Number(t.cost || 0), 0)
    : (300 + Math.max(0, stops.length - 1) * 120);

  const stayCost = durationDays * 95;
  const mealCost = durationDays * 45;

  const activityCost = stops.reduce((total, stop) => {
    return total + (stop.activities || []).reduce((aSum, act) => aSum + (Number(act.cost || act.estimatedCost) || 0), 0);
  }, 0);

  const totalEstimated = transportCost + stayCost + activityCost + mealCost;
  const actualExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const effectiveSpending = actualExpenses > 0 ? actualExpenses : totalEstimated;
  const userBudget = Number(trip.budget) || 2500;
  const remainingBudget = userBudget - effectiveSpending;
  const percentageUsed = userBudget > 0 ? Number(((effectiveSpending / userBudget) * 100).toFixed(1)) : 0;
  const isOverBudget = effectiveSpending > userBudget;
  const avgDailyCost = Number((effectiveSpending / Math.max(1, durationDays)).toFixed(2));

  // Category totals from expenses
  const categoryTotals = {
    Transport: transportCost,
    Accommodation: stayCost,
    Activities: activityCost,
    Meals: mealCost,
    Miscellaneous: 0
  };

  expenses.forEach(e => {
    const cat = e.category || 'Miscellaneous';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
  });

  return {
    transport: transportCost,
    stay: stayCost,
    activities: activityCost,
    meals: mealCost,
    misc: categoryTotals.Miscellaneous || 0,
    totalEstimated,
    actualExpenses,
    effectiveSpending,
    userBudget,
    remainingBudget,
    percentageUsed,
    isOverBudget,
    avgDailyCost,
    durationDays,
    categoryTotals
  };
};

// --- TRIP CONFLICT & TIME DETECTOR ---
export const detectTripConflicts = (trip, transportSegments = []) => {
  const conflicts = [];
  if (!trip) return conflicts;

  const stops = trip.stops || [];
  const tripStart = trip.startDate;
  const tripEnd = trip.endDate;

  // 1. Stop Date Validation
  stops.forEach((stop, idx) => {
    if (tripStart && stop.startDate < tripStart) {
      conflicts.push(`Stop "${stop.city}" start date (${stop.startDate}) is before trip start date (${tripStart}).`);
    }
    if (tripEnd && stop.endDate > tripEnd) {
      conflicts.push(`Stop "${stop.city}" end date (${stop.endDate}) is after trip end date (${tripEnd}).`);
    }
    if (stop.startDate > stop.endDate) {
      conflicts.push(`Stop "${stop.city}" end date cannot be earlier than start date.`);
    }

    // Overlapping sequential stops
    if (idx > 0) {
      const prevStop = stops[idx - 1];
      if (stop.startDate < prevStop.endDate) {
        conflicts.push(`Stop "${stop.city}" overlaps with previous stop "${prevStop.city}".`);
      }
    }
  });

  // 2. Activity Conflict & Travel Time Check
  stops.forEach(stop => {
    const activities = stop.activities || [];
    activities.forEach((act, aIdx) => {
      // Date bounds
      if (stop.startDate && act.date && act.date < stop.startDate) {
        conflicts.push(`Activity "${act.name}" date (${act.date}) is before stop start date (${stop.startDate}).`);
      }
      if (stop.endDate && act.date && act.date > stop.endDate) {
        conflicts.push(`Activity "${act.name}" date (${act.date}) is after stop end date (${stop.endDate}).`);
      }

      // Check consecutive activity time gaps
      if (aIdx > 0) {
        const prevAct = activities[aIdx - 1];
        if (prevAct.date === act.date && prevAct.time && act.time) {
          if (prevAct.time === act.time) {
            conflicts.push(`⚠ Activity "${act.name}" overlaps with "${prevAct.name}" at ${act.time}.`);
          }
        }
      }
    });
  });

  // 3. Budget Overflow Check
  const budgetInfo = calculateTripBudget(trip, [], transportSegments);
  if (budgetInfo.isOverBudget) {
    conflicts.push(`⚠ Trip estimated cost ($${budgetInfo.effectiveSpending}) exceeds target budget ($${budgetInfo.userBudget}) by $${Math.abs(budgetInfo.remainingBudget)}.`);
  }

  return conflicts;
};

// --- TRIP HEALTH SCORE ENGINE ---
export const calculateTripHealthScore = (trip, transportSegments = []) => {
  if (!trip) return { score: 100, status: 'Excellent', deductions: [] };

  let score = 100;
  const deductions = [];

  const conflicts = detectTripConflicts(trip, transportSegments);
  if (conflicts.length > 0) {
    score -= Math.min(40, conflicts.length * 10);
    deductions.push(`${conflicts.length} itinerary conflict(s) or date overlaps detected.`);
  }

  const stops = trip.stops || [];
  if (stops.length === 0) {
    score -= 20;
    deductions.push('No destination cities/stops added yet.');
  } else {
    const emptyStops = stops.filter(s => !s.activities || s.activities.length === 0);
    if (emptyStops.length > 0) {
      score -= 10;
      deductions.push(`${emptyStops.length} stop(s) have no planned activities.`);
    }
  }

  const budgetInfo = calculateTripBudget(trip, [], transportSegments);
  if (budgetInfo.isOverBudget) {
    score -= 15;
    deductions.push('Estimated trip total exceeds allocated budget.');
  }

  if (!trip.coverImage) {
    score -= 5;
    deductions.push('Missing cover image photo.');
  }

  score = Math.max(0, Math.min(100, score));

  let status = 'Excellent';
  if (score < 50) status = 'Needs Attention';
  else if (score < 80) status = 'Good';

  return { score, status, deductions };
};

// --- DETERMINISTIC SMART RECOMMENDATION ENGINE ---
export const calculateRecommendationScore = (user, city) => {
  let score = 75; // base score
  const whyRecommended = [];

  // 1. Budget Match
  const userBudget = 2500;
  const cityCost = (city.costIndex || 5) * 250;
  if (cityCost <= userBudget) {
    score += 10;
    whyRecommended.push('Fits comfortably within your target budget');
  }

  // 2. Interest / Region Match
  if (user?.travelStyle) {
    if (user.travelStyle.includes('Culture') && (city.description?.includes('temple') || city.description?.includes('art') || city.region === 'Europe')) {
      score += 10;
      whyRecommended.push(`Matches your ${user.travelStyle} travel style`);
    } else {
      whyRecommended.push('Popular cultural & scenic highlights');
    }
  } else {
    whyRecommended.push('Matches culture & sightseeing preferences');
  }

  // 3. Popularity Score
  if ((city.popularity || 80) >= 90) {
    score += 5;
    whyRecommended.push('Top-rated global destination (90%+ rating)');
  }

  // 4. Duration Suitability
  whyRecommended.push('Suitable for a 5 to 7-day vacation itinerary');

  const finalScore = Math.min(99, Math.max(65, score));
  return { matchScore: finalScore, whyRecommended };
};

// --- API METHOD EXPORTS WITH FALLBACK ---

// AUTH
export const authService = {
  async login(email, password) {
    try {
      const res = await apiRequest('/auth/login', { method: 'POST', body: { email, password }, requiresAuth: false });
      if (res?.data?.token) setToken(res.data.token);
      currentUserSession = normalizeUser(res?.data?.user) || currentUserSession;
      return { user: currentUserSession, token: res?.data?.token };
    } catch (err) {
      if (!email || !password) throw new Error('Email and password required.');
      currentUserSession = { ...currentUserSession, email };
      return { user: currentUserSession, token: 'mock_jwt_token_123' };
    }
  },

  async signup({ name, email, password }) {
    try {
      const res = await apiRequest('/auth/signup', { method: 'POST', body: { name, email, password }, requiresAuth: false });
      if (res?.data?.token) setToken(res.data.token);
      currentUserSession = normalizeUser(res?.data?.user) || currentUserSession;
      return { user: currentUserSession, token: res?.data?.token };
    } catch (err) {
      if (!name || !email || !password) throw new Error('All fields required.');
      currentUserSession = { id: `usr_${Date.now()}`, name, email, avatar: currentUserSession.avatar, preferredCurrency: 'USD' };
      return { user: currentUserSession, token: 'mock_jwt_token_456' };
    }
  },

  async getCurrentUser() {
    try {
      const res = await apiRequest('/auth/me', { method: 'GET', requiresAuth: true });
      currentUserSession = normalizeUser(res?.data?.user) || currentUserSession;
      return currentUserSession;
    } catch (err) {
      return currentUserSession;
    }
  },

  async updateProfile(profileData) {
    try {
      const res = await apiRequest('/profile', {
        method: 'PUT',
        body: {
          name: profileData.name,
          avatar: profileData.avatar,
          preferred_currency: profileData.preferredCurrency || profileData.preferred_currency,
          travel_style: profileData.travelStyle || profileData.travel_style
        }
      });
      currentUserSession = normalizeUser(res?.data?.user) || currentUserSession;
      return currentUserSession;
    } catch (err) {
      currentUserSession = { ...currentUserSession, ...profileData };
      return currentUserSession;
    }
  },

  async deleteAccount() {
    try {
      await apiRequest('/profile', { method: 'DELETE' });
    } catch (e) { }
    removeToken();
    return true;
  },

  async logout() {
    removeToken();
    return true;
  }
};

// TRIPS
export const getTrips = async () => {
  try {
    const res = await apiRequest('/trips', { method: 'GET' });
    if (res?.data && res.data.length > 0) return res.data.map(normalizeTrip);
  } catch (err) { }
  return localTripsStore.map(normalizeTrip);
};

export const getTrip = async (id) => {
  try {
    const res = await apiRequest(`/trips/${id}`, { method: 'GET' });
    if (res?.data) return normalizeTrip(res.data);
  } catch (err) { }
  const trip = localTripsStore.find(t => String(t.id) === String(id));
  if (!trip) throw new Error(`Trip ${id} not found.`);
  return normalizeTrip(trip);
};

export const createTrip = async (tripData) => {
  try {
    const res = await apiRequest('/trips', {
      method: 'POST',
      body: {
        name: tripData.name || tripData.destination,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        budget: Number(tripData.budget) || 0,
        cover_image: tripData.coverImage
      }
    });
    if (res?.data) return normalizeTrip(res.data);
  } catch (err) { }

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
  return normalizeTrip(newTrip);
};

export const updateTrip = async (id, tripData) => {
  try {
    const res = await apiRequest(`/trips/${id}`, {
      method: 'PUT',
      body: {
        name: tripData.name,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        budget: Number(tripData.budget),
        cover_image: tripData.coverImage
      }
    });
    if (res?.data) return normalizeTrip(res.data);
  } catch (err) { }

  const idx = localTripsStore.findIndex(t => String(t.id) === String(id));
  if (idx !== -1) {
    localTripsStore[idx] = { ...localTripsStore[idx], ...tripData };
    return normalizeTrip(localTripsStore[idx]);
  }
  return normalizeTrip({ id, ...tripData });
};

export const deleteTrip = async (id) => {
  try {
    await apiRequest(`/trips/${id}`, { method: 'DELETE' });
  } catch (err) { }
  localTripsStore = localTripsStore.filter(t => String(t.id) !== String(id));
  return true;
};

export const duplicateTrip = async (id) => {
  const original = await getTrip(id);
  const copy = await createTrip({
    name: `Copy of ${original.name}`,
    description: original.description,
    startDate: original.startDate,
    endDate: original.endDate,
    budget: original.budget,
    coverImage: original.coverImage
  });
  return copy;
};

// STOPS
export const addStop = async (tripId, stopData) => {
  try {
    const res = await apiRequest(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: {
        city_id: stopData.cityId || null,
        city: stopData.city,
        start_date: stopData.startDate,
        end_date: stopData.endDate,
        position: stopData.position || 0
      }
    });
    const updatedTrip = await getTrip(tripId);
    return { trip: updatedTrip, stop: normalizeStop(res?.data) };
  } catch (err) { }

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
  return { trip: normalizeTrip(trip), stop: normalizeStop(newStop) };
};

export const deleteStop = async (tripId, stopId) => {
  try {
    await apiRequest(`/stops/${stopId}`, { method: 'DELETE' });
  } catch (err) { }
  const trip = localTripsStore.find(t => String(t.id) === String(tripId));
  if (trip && trip.stops) {
    trip.stops = trip.stops.filter(s => String(s.id) !== String(stopId));
  }
  return getTrip(tripId);
};

export const reorderStops = async (tripId, updatedStops) => {
  try {
    await apiRequest(`/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      body: { stops: updatedStops.map((s, idx) => ({ id: Number(s.id), position: idx })) }
    });
  } catch (err) { }
  return getTrip(tripId);
};

// ACTIVITIES
export const getActivities = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.cityId) queryParams.append('city_id', params.cityId);
    if (params.category && params.category !== 'All') queryParams.append('category', params.category);

    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await apiRequest(`/activities${queryStr}`, { method: 'GET', requiresAuth: false });
    if (res?.data && res.data.length > 0) return res.data.map(normalizeActivity);
  } catch (err) { }

  let list = SEED_ACTIVITIES.map(normalizeActivity);
  if (params.category && params.category !== 'All') {
    list = list.filter(a => a.category?.toLowerCase() === params.category.toLowerCase());
  }
  if (params.maxCost !== undefined && params.maxCost !== null && params.maxCost !== '') {
    list = list.filter(a => a.cost <= Number(params.maxCost));
  }
  if (params.searchQuery) {
    const q = params.searchQuery.toLowerCase();
    list = list.filter(a => a.name.toLowerCase().includes(q) || a.cityName.toLowerCase().includes(q));
  }
  return list;
};

export const searchActivities = getActivities;

export const addActivity = async (tripId, stopId, activityData) => {
  try {
    const res = await apiRequest(`/trips/${tripId}/activities`, {
      method: 'POST',
      body: {
        activity_id: activityData.activityId || null,
        stop_id: stopId ? Number(stopId) : null,
        custom_name: activityData.name,
        scheduled_date: activityData.date,
        scheduled_time: activityData.time,
        cost: Number(activityData.cost) || 0
      }
    });
    const updatedTrip = await getTrip(tripId);
    return { trip: updatedTrip, activity: normalizeActivity(res?.data) };
  } catch (err) { }

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
  return { trip: normalizeTrip(trip), activity: normalizeActivity(newAct) };
};

export const removeActivity = async (tripId, stopId, activityId) => {
  try {
    await apiRequest(`/trips/${tripId}/activities/${activityId}`, { method: 'DELETE' });
  } catch (err) { }
  return getTrip(tripId);
};

// CITIES & SAVED DESTINATIONS
export const getCities = async () => {
  try {
    const res = await apiRequest('/cities', { method: 'GET', requiresAuth: false });
    if (res?.data && res.data.length > 0) return res.data.map(normalizeCity);
  } catch (err) { }
  return SEED_CITIES.map(normalizeCity);
};

export const searchCities = async (query = '') => {
  try {
    const endpoint = query ? `/cities/search?q=${encodeURIComponent(query)}` : '/cities';
    const res = await apiRequest(endpoint, { method: 'GET', requiresAuth: false });
    if (res?.data && res.data.length > 0) return res.data.map(normalizeCity);
  } catch (err) { }
  const q = query.toLowerCase().trim();
  if (!q) return SEED_CITIES.map(normalizeCity);
  return SEED_CITIES.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q) ||
    c.region.toLowerCase().includes(q)
  ).map(normalizeCity);
};

export const toggleSaveCity = async (cityId) => {
  const isSaved = localSavedCities.includes(String(cityId));
  try {
    if (isSaved) {
      await apiRequest(`/cities/${cityId}/save`, { method: 'DELETE' });
      localSavedCities = localSavedCities.filter(id => id !== String(cityId));
    } else {
      await apiRequest(`/cities/${cityId}/save`, { method: 'POST' });
      localSavedCities.push(String(cityId));
    }
  } catch (err) {
    if (isSaved) localSavedCities = localSavedCities.filter(id => id !== String(cityId));
    else localSavedCities.push(String(cityId));
  }
  return !isSaved;
};

export const getSavedCities = async () => {
  try {
    const res = await apiRequest('/profile/saved-cities', { method: 'GET' });
    if (res?.data && res.data.length > 0) return res.data.map(normalizeCity);
  } catch (err) { }
  return SEED_CITIES.filter(c => localSavedCities.includes(String(c.id))).map(normalizeCity);
};

// TRANSPORT SEGMENTS
export const getTransportSegments = async (tripId) => {
  try {
    const res = await apiRequest(`/trips/${tripId}/transport`, { method: 'GET' });
    if (res?.data) return res.data.map(normalizeTransport);
  } catch (err) { }
  return [];
};

export const addTransportSegment = async (tripId, segmentData) => {
  try {
    const res = await apiRequest(`/trips/${tripId}/transport`, {
      method: 'POST',
      body: {
        mode: segmentData.mode || 'Flight',
        departure_location: segmentData.departureLocation,
        arrival_location: segmentData.arrivalLocation,
        departure_time: segmentData.departureTime,
        arrival_time: segmentData.arrivalTime,
        cost: Number(segmentData.cost) || 0
      }
    });
    if (res?.data) return normalizeTransport(res.data);
  } catch (err) { }

  return normalizeTransport({
    id: `trans_${Date.now()}`,
    tripId,
    ...segmentData
  });
};

export const deleteTransportSegment = async (segmentId) => {
  try {
    await apiRequest(`/transport/${segmentId}`, { method: 'DELETE' });
  } catch (err) { }
  return true;
};

// EXPENSES
export const getExpenses = async (tripId) => {
  try {
    const res = await apiRequest(`/trips/${tripId}/expenses`, { method: 'GET' });
    if (res?.data) return res.data.map(normalizeExpense);
  } catch (err) { }
  return [];
};

export const addExpense = async (tripId, expenseData) => {
  try {
    const res = await apiRequest(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: {
        category: expenseData.category,
        amount: Number(expenseData.amount),
        description: expenseData.description,
        expense_date: expenseData.expenseDate
      }
    });
    if (res?.data) return normalizeExpense(res.data);
  } catch (err) { }

  return normalizeExpense({
    id: `exp_${Date.now()}`,
    tripId,
    ...expenseData
  });
};

// PUBLIC SHARE & COPY TRIP
export const toggleShareStatus = async (tripId, enable = true) => {
  try {
    const res = await apiRequest(`/trips/${tripId}/share`, {
      method: 'POST',
      body: { enable }
    });
    return res?.data;
  } catch (err) { }
  return { tripId, shareId: `sh_demo_${tripId}`, isPublic: enable };
};

export const getSharedTrip = async (shareId) => {
  try {
    const res = await apiRequest(`/shared/${shareId}`, { method: 'GET', requiresAuth: false });
    if (res?.data) return normalizeTrip(res.data);
  } catch (err) { }
  const trip = localTripsStore.find(t => t.shareId === shareId || String(t.id) === String(shareId));
  if (trip) return normalizeTrip(trip);
  throw new Error('Shared trip not found.');
};

export const copySharedTrip = async (shareId) => {
  try {
    const res = await apiRequest(`/shared/${shareId}/copy`, { method: 'POST' });
    if (res?.data) return normalizeTrip(res.data);
  } catch (err) { }

  const original = await getSharedTrip(shareId);
  return await duplicateTrip(original.id);
};

export const tripService = {
  getUpcomingTrips: getTrips,
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  addStop,
  addActivity,
  removeActivity,
  deleteStop,
  reorderStops,
  getCities,
  searchCities,
  getActivities,
  searchActivities,
  calculateTripBudget,
  detectTripConflicts,
  calculateTripHealthScore,
  calculateRecommendationScore,
  toggleSaveCity,
  getSavedCities,
  getTransportSegments,
  addTransportSegment,
  deleteTransportSegment,
  getExpenses,
  addExpense,
  toggleShareStatus,
  getSharedTrip,
  copySharedTrip,

  async getRecommendedDestinations() {
    const cities = await getCities();
    return cities.slice(0, 4).map(c => {
      const rec = calculateRecommendationScore(currentUserSession, c);
      return {
        id: c.id,
        title: c.name,
        location: `${c.name}, ${c.country}`,
        rating: 4.8,
        reviewsCount: c.popularity * 3,
        estimatedCost: c.costIndex * 250,
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        category: c.region || 'Discovery',
        matchScore: rec.matchScore,
        whyRecommended: rec.whyRecommended
      };
    });
  },

  async getBudgetSummary() {
    const trips = await getTrips();
    const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
    const totalSpent = trips.reduce((acc, t) => acc + (t.spent || 0), 0);
    return {
      totalBudget,
      totalSpent,
      remaining: Math.max(0, totalBudget - totalSpent),
      currency: '$'
    };
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
  duplicateTrip,
  addStop,
  addActivity,
  removeActivity,
  deleteStop,
  reorderStops,
  getCities,
  searchCities,
  getActivities,
  searchActivities,
  calculateTripBudget,
  detectTripConflicts,
  calculateTripHealthScore,
  calculateRecommendationScore,
  toggleSaveCity,
  getSavedCities,
  getTransportSegments,
  addTransportSegment,
  deleteTransportSegment,
  getExpenses,
  addExpense,
  toggleShareStatus,
  getSharedTrip,
  copySharedTrip
};
