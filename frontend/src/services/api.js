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
    destination: 'Kyoto & Tokyo, Japan',
    country: 'Japan',
    startDate: '2026-09-15',
    endDate: '2026-09-28',
    durationDays: 14,
    status: 'Upcoming',
    budget: 3500,
    spent: 1200,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    tags: ['Culture', 'Food', 'Temples']
  },
  {
    id: 'trip_2',
    destination: 'Amalfi Coast, Italy',
    country: 'Italy',
    startDate: '2026-11-04',
    endDate: '2026-11-12',
    durationDays: 8,
    status: 'Planning',
    budget: 2800,
    spent: 650,
    coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    tags: ['Coastal', 'Scenic', 'Wine']
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
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email, password) {
    await delay(500);
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
    await delay(500);
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
    await delay(200);
    return currentUserSession;
  },

  async logout() {
    await delay(200);
    currentUserSession = null;
    return true;
  }
};

export const tripService = {
  async getUpcomingTrips() {
    await delay(400);
    return [...currentTripsList];
  },

  async getRecommendedDestinations() {
    await delay(300);
    return [...RECOMMENDED_DESTINATIONS];
  },

  async getBudgetSummary() {
    await delay(300);
    const totalBudget = currentTripsList.reduce((acc, t) => acc + (t.budget || 0), 0);
    const totalSpent = currentTripsList.reduce((acc, t) => acc + (t.spent || 0), 0);
    return {
      totalBudget: totalBudget || 0,
      totalSpent: totalSpent || 0,
      remaining: Math.max(0, totalBudget - totalSpent),
      currency: '$'
    };
  },

  async createTrip(tripData) {
    await delay(500);
    const newTrip = {
      id: `trip_${Date.now()}`,
      destination: tripData.destination || 'New Travel Destination',
      country: tripData.country || 'Global',
      startDate: tripData.startDate || new Date().toISOString().split('T')[0],
      endDate: tripData.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      durationDays: Number(tripData.durationDays) || 7,
      status: 'Planning',
      budget: Number(tripData.budget) || 2000,
      spent: 0,
      coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      tags: tripData.tags || ['Vacation', 'Exploration']
    };
    currentTripsList.unshift(newTrip);
    return newTrip;
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
  trips: tripService
};
