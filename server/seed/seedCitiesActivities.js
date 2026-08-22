const db = require('../db');

const sampleCities = [
  { name: 'Tokyo', country: 'Japan', cost_index: 88, popularity: 98 },
  { name: 'Paris', country: 'France', cost_index: 82, popularity: 96 },
  { name: 'Bangkok', country: 'Thailand', cost_index: 35, popularity: 94 },
  { name: 'Denpasar (Bali)', country: 'Indonesia', cost_index: 30, popularity: 92 },
  { name: 'New York', country: 'United States', cost_index: 95, popularity: 97 },
  { name: 'Prague', country: 'Czech Republic', cost_index: 48, popularity: 88 },
  { name: 'Lisbon', country: 'Portugal', cost_index: 55, popularity: 90 },
  { name: 'Cairo', country: 'Egypt', cost_index: 25, popularity: 84 },
  { name: 'Rome', country: 'Italy', cost_index: 75, popularity: 95 },
  { name: 'Sydney', country: 'Australia', cost_index: 85, popularity: 91 },
  { name: 'Cape Town', country: 'South Africa', cost_index: 40, popularity: 87 },
  { name: 'Rio de Janeiro', country: 'Brazil', cost_index: 45, popularity: 86 },
  { name: 'Barcelona', country: 'Spain', cost_index: 70, popularity: 93 },
  { name: 'Budapest', country: 'Hungary', cost_index: 42, popularity: 85 },
  { name: 'Mexico City', country: 'Mexico', cost_index: 38, popularity: 88 },
  { name: 'Hanoi', country: 'Vietnam', cost_index: 28, popularity: 86 },
  { name: 'Athens', country: 'Greece', cost_index: 58, popularity: 89 },
  { name: 'Dubai', country: 'United Arab Emirates', cost_index: 90, popularity: 94 }
];

async function seedCities() {
  console.log('Starting cities seeding...');
  
  try {
    // 1. Ensure table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        cost_index INTEGER NOT NULL,
        popularity INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Clear existing entries for an idempotent seed
    await db.query('TRUNCATE TABLE cities RESTART IDENTITY CASCADE;');

    // 3. Insert sample cities
    for (const city of sampleCities) {
      await db.query(
        'INSERT INTO cities (name, country, cost_index, popularity) VALUES ($1, $2, $3, $4)',
        [city.name, city.country, city.cost_index, city.popularity]
      );
    }

    console.log(`Successfully seeded ${sampleCities.length} sample cities into database.`);
  } catch (err) {
    console.error('Error seeding cities:', err);
    process.exitCode = 1;
  } finally {
    if (db.pool && typeof db.pool.end === 'function') {
      try {
        await db.pool.end();
      } catch (e) {}
    }
  }
}

if (require.main === module) {
  seedCities();
}

module.exports = { seedCities, sampleCities };
