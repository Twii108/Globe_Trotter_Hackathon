const { Pool } = require('pg');

let pool = null;
let usePg = false;

try {
  pool = require('./config/db');
  if (pool && typeof pool.query === 'function') {
    usePg = true;
  }
} catch (e) {
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      usePg = true;
    } catch (err) {
      console.warn('PostgreSQL pool init failed, fallback to in-memory store:', err.message);
    }
  }
}

const inMemoryTrips = [];
let nextTripId = 1;

const db = {
  async query(text, params) {
    if (usePg && pool) {
      return pool.query(text, params);
    }
    return { rows: [] };
  },
  inMemoryTrips,
  getNextTripId: () => nextTripId++,
  isPgUsed: () => usePg && pool !== null
};

module.exports = db;

