const db = require('../db');

class Trip {
  static async create({ user_id, name, start_date, end_date, description, cover_photo_url }) {
    if (db.isPgUsed()) {
      const query = `
        INSERT INTO trips (user_id, name, start_date, end_date, description, cover_photo_url, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *;
      `;
      const values = [user_id, name, start_date || null, end_date || null, description || null, cover_photo_url || null];
      const result = await db.query(query, values);
      return result.rows[0];
    } else {
      const newTrip = {
        id: db.getNextTripId(),
        user_id: Number(user_id),
        name,
        start_date: start_date || null,
        end_date: end_date || null,
        description: description || null,
        cover_photo_url: cover_photo_url || null,
        created_at: new Date().toISOString()
      };
      db.inMemoryTrips.push(newTrip);
      return newTrip;
    }
  }

  static async findByUserId(user_id) {
    if (db.isPgUsed()) {
      const query = `SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC;`;
      const result = await db.query(query, [user_id]);
      return result.rows;
    } else {
      return db.inMemoryTrips.filter(trip => Number(trip.user_id) === Number(user_id));
    }
  }

  static async findById(id) {
    if (db.isPgUsed()) {
      const query = `SELECT * FROM trips WHERE id = $1;`;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } else {
      return db.inMemoryTrips.find(trip => Number(trip.id) === Number(id)) || null;
    }
  }

  static async findAll() {
    if (db.isPgUsed()) {
      const query = `SELECT * FROM trips ORDER BY created_at DESC;`;
      const result = await db.query(query);
      return result.rows;
    } else {
      return db.inMemoryTrips;
    }
  }
}

module.exports = Trip;
