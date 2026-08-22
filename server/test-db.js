// Run this file using Node to test the DB connection
require('dotenv').config();
const db = require('./config/db');

async function testConnection() {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    console.log('Database time:', result.rows[0].current_time);
    process.exit(0);
  } catch (err) {
    console.error('Failed to query database:', err);
    process.exit(1);
  }
}

testConnection();
