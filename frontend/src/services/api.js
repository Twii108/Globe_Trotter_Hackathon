// GlobeTrotter Real API Service Layer
// Connects directly to Express + SQLite backend (http://localhost:5000/api)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'globetrotter_token';

// Helper to retrieve JWT token from localStorage
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Centralized HTTP Request Handler
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

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `HTTP error ${response.status}`;
    const err = new Error(errorMessage);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// --- REUSABLE NORMALIZATION LAYER ---

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
    duration: Number(act.duration) || 1,
    cost: Number(act.cost) || 0,
    estimatedCost: Number(act.cost) || 0,
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

  return {
    id: String(trip.id),
    userId: String(trip.user_id || trip.userId || ''),
    name: trip.name || trip.title || trip.destination || 'New Adventure',
    destination: trip.destination || trip.name || 'Global Destination',
    country: trip.country || 'International',
    startDate,
    endDate,
    durationDays: Number(trip.durationDays) || durationDays,
    status: trip.status || (new Date(startDate) > new Date() ? 'Upcoming' : 'Planning'),
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
    description: city.description || ''
  };
};

export const normalizeExpense = (expense) => {
  if (!expense) return null;
  return {
    id: String(expense.id),
    tripId: String(expense.trip_id || expense.tripId),
    category: expense.category || 'other',
    amount: Number(expense.amount) || 0,
    description: expense.description || '',
    expenseDate: expense.expense_date || expense.expenseDate || expense.created_at
  };
};

// --- AUTHENTICATION SERVICE ---

export const authService = {
  async login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false
    });

    if (res?.data?.token) {
      setToken(res.data.token);
    }
    const user = normalizeUser(res?.data?.user);
    return { user, token: res?.data?.token };
  },

  async signup({ name, email, password }) {
    const res = await apiRequest('/auth/signup', {
      method: 'POST',
      body: { name, email, password },
      requiresAuth: false
    });

    if (res?.data?.token) {
      setToken(res.data.token);
    }
    const user = normalizeUser(res?.data?.user);
    return { user, token: res?.data?.token };
  },

  async getCurrentUser() {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await apiRequest('/auth/me', { method: 'GET', requiresAuth: true });
      return normalizeUser(res?.data?.user);
    } catch (err) {
      removeToken();
      return null;
    }
  },

  async updateProfile(profileData) {
    const res = await apiRequest('/profile', {
      method: 'PUT',
      body: {
        name: profileData.name,
        avatar: profileData.avatar,
        preferred_currency: profileData.preferredCurrency || profileData.preferred_currency
      }
    });
    return normalizeUser(res?.data?.user);
  },

  async logout() {
    removeToken();
    return true;
  }
};

// --- TRIP SERVICE ---

export const getTrips = async () => {
  const res = await apiRequest('/trips', { method: 'GET' });
  const rawTrips = res?.data || [];
  return rawTrips.map(normalizeTrip);
};

export const getTrip = async (id) => {
  const res = await apiRequest(`/trips/${id}`, { method: 'GET' });
  return normalizeTrip(res?.data);
};

export const createTrip = async (tripData) => {
  const payload = {
    name: tripData.name || tripData.destination,
    description: tripData.description || '',
    start_date: tripData.startDate || tripData.start_date,
    end_date: tripData.endDate || tripData.end_date,
    budget: Number(tripData.budget) || 0,
    cover_image: tripData.coverImage || tripData.cover_image
  };

  const res = await apiRequest('/trips', {
    method: 'POST',
    body: payload
  });
  return normalizeTrip(res?.data);
};

export const updateTrip = async (id, tripData) => {
  const payload = {
    name: tripData.name,
    description: tripData.description,
    start_date: tripData.startDate || tripData.start_date,
    end_date: tripData.endDate || tripData.end_date,
    budget: tripData.budget !== undefined ? Number(tripData.budget) : undefined,
    cover_image: tripData.coverImage || tripData.cover_image
  };

  const res = await apiRequest(`/trips/${id}`, {
    method: 'PUT',
    body: payload
  });
  return normalizeTrip(res?.data);
};

export const deleteTrip = async (id) => {
  await apiRequest(`/trips/${id}`, { method: 'DELETE' });
  return true;
};

// --- STOP SERVICE ---

export const addStop = async (tripId, stopData) => {
  const payload = {
    city_id: stopData.cityId || stopData.city_id || null,
    city: stopData.city,
    start_date: stopData.startDate || stopData.start_date,
    end_date: stopData.endDate || stopData.end_date,
    position: stopData.position
  };

  const res = await apiRequest(`/trips/${tripId}/stops`, {
    method: 'POST',
    body: payload
  });

  const updatedTrip = await getTrip(tripId);
  return { trip: updatedTrip, stop: normalizeStop(res?.data) };
};

export const deleteStop = async (tripId, stopId) => {
  await apiRequest(`/stops/${stopId}`, { method: 'DELETE' });
  return await getTrip(tripId);
};

export const reorderStops = async (tripId, updatedStops) => {
  const payload = {
    stops: updatedStops.map((stop, idx) => ({
      id: Number(stop.id),
      position: idx
    }))
  };

  await apiRequest(`/trips/${tripId}/stops/reorder`, {
    method: 'PUT',
    body: payload
  });

  return await getTrip(tripId);
};

// --- ACTIVITY SERVICE ---

export const getActivities = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.cityId) queryParams.append('city_id', params.cityId);
  if (params.category && params.category !== 'All') queryParams.append('category', params.category);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await apiRequest(`/activities${queryStr}`, { method: 'GET', requiresAuth: false });
  let list = (res?.data || []).map(normalizeActivity);

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
  const payload = {
    activity_id: activityData.activityId || activityData.activity_id || null,
    stop_id: stopId ? Number(stopId) : null,
    custom_name: activityData.name,
    scheduled_date: activityData.date || activityData.scheduled_date,
    scheduled_time: activityData.time || activityData.scheduled_time,
    cost: Number(activityData.cost) || 0
  };

  const res = await apiRequest(`/trips/${tripId}/activities`, {
    method: 'POST',
    body: payload
  });

  const updatedTrip = await getTrip(tripId);
  return { trip: updatedTrip, activity: normalizeActivity(res?.data) };
};

export const removeActivity = async (tripId, stopId, activityId) => {
  await apiRequest(`/trips/${tripId}/activities/${activityId}`, { method: 'DELETE' });
  return await getTrip(tripId);
};

// --- CITY & DISCOVERY SERVICE ---

export const getCities = async () => {
  const res = await apiRequest('/cities', { method: 'GET', requiresAuth: false });
  return (res?.data || []).map(normalizeCity);
};

export const searchCities = async (query = '') => {
  const endpoint = query ? `/cities/search?q=${encodeURIComponent(query)}` : '/cities';
  const res = await apiRequest(endpoint, { method: 'GET', requiresAuth: false });
  return (res?.data || []).map(normalizeCity);
};

// --- BUDGET, TIMELINE, EXPENSES & SHARING SERVICES ---

export const getTripBudget = async (tripId) => {
  const res = await apiRequest(`/trips/${tripId}/budget`, { method: 'GET' });
  return res?.data;
};

export const getTripTimeline = async (tripId) => {
  const res = await apiRequest(`/trips/${tripId}/timeline`, { method: 'GET' });
  return res?.data;
};

export const addExpense = async (tripId, expenseData) => {
  const res = await apiRequest(`/trips/${tripId}/expenses`, {
    method: 'POST',
    body: {
      category: expenseData.category,
      amount: Number(expenseData.amount),
      description: expenseData.description
    }
  });
  return normalizeExpense(res?.data);
};

export const getExpenses = async (tripId) => {
  const res = await apiRequest(`/trips/${tripId}/expenses`, { method: 'GET' });
  return (res?.data || []).map(normalizeExpense);
};

export const deleteExpense = async (expenseId) => {
  await apiRequest(`/expenses/${expenseId}`, { method: 'DELETE' });
  return true;
};

export const shareTrip = async (tripId) => {
  const res = await apiRequest(`/trips/${tripId}/share`, { method: 'POST' });
  return res?.data;
};

export const getSharedTrip = async (shareId) => {
  const res = await apiRequest(`/shared/${shareId}`, { method: 'GET', requiresAuth: false });
  return normalizeTrip(res?.data);
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
    try {
      const cities = await getCities();
      return cities.slice(0, 4).map(c => ({
        id: c.id,
        title: c.name,
        location: `${c.name}, ${c.country}`,
        rating: 4.8,
        reviewsCount: c.popularity * 3,
        estimatedCost: c.costIndex * 250,
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        category: c.region || 'Discovery'
      }));
    } catch (e) {
      return [];
    }
  },

  async getBudgetSummary() {
    try {
      const trips = await getTrips();
      const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
      const totalSpent = trips.reduce((acc, t) => acc + (t.spent || 0), 0);
      return {
        totalBudget,
        totalSpent,
        remaining: Math.max(0, totalBudget - totalSpent),
        currency: '$'
      };
    } catch (e) {
      return { totalBudget: 0, totalSpent: 0, remaining: 0, currency: '$' };
    }
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
  getCities,
  searchCities,
  getActivities,
  searchActivities,
  getTripBudget,
  getTripTimeline,
  addExpense,
  getExpenses,
  deleteExpense,
  shareTrip,
  getSharedTrip
};
