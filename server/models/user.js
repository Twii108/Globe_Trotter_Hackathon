const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  // Create a new user
  async create(name, email, plainPassword, photoUrl = null) {
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const query = `
      INSERT INTO users (name, email, password_hash, photo_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, photo_url, created_at;
    `;
    const values = [name, email, passwordHash, photoUrl];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Find user by email (used for login)
  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await db.query(query, [email]);
    return rows[0];
  },

  // Find user by ID (used for profile view)
  async findById(id) {
    const query = `SELECT id, name, email, photo_url, created_at FROM users WHERE id = $1`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  // Update user profile
  async updateProfile(id, name, photoUrl) {
    const query = `
      UPDATE users 
      SET name = $1, photo_url = $2
      WHERE id = $3 
      RETURNING id, name, email, photo_url, created_at;
    `;
    const { rows } = await db.query(query, [name, photoUrl, id]);
    return rows[0];
  },

  // Delete user account
  async delete(id) {
    const query = `DELETE FROM users WHERE id = $1`;
    await db.query(query, [id]);
  }
};

module.exports = User;
