const db = require('../db');

class Trip {
  static async create({ user_id, name, start_date, end_date, description, cover_photo_url }) {
    const query = `
      INSERT INTO trips (user_id, name, start_date, end_date, description, cover_photo_url, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    const values = [user_id, name, start_date || null, end_date || null, description || null, cover_photo_url || null];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(user_id) {
    const query = `SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC;`;
    const result = await db.query(query, [user_id]);
    return result.rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM trips WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll() {
    const query = `SELECT * FROM trips ORDER BY created_at DESC;`;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Trip;
