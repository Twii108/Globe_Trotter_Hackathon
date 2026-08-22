const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'globetrotter.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initDatabase();
  }
});

async function initDatabase() {
  db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) {
      console.error('Failed to enable foreign keys:', err.message);
    }
  });

  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql, async (err) => {
      if (err) {
        console.error('Error initializing database schema:', err.message);
      } else {
        console.log('Database schema initialized successfully.');
        await runMigrationsAsync();
        seedInitialData();
      }
    });
  }
}

function runMigrationsAsync() {
  return new Promise((resolve) => {
    const addColumnIfMissing = (table, column, type) => {
      return new Promise((resCol) => {
        db.all(`PRAGMA table_info(${table});`, [], (err, rows) => {
          if (err || !rows) return resCol();
          const exists = rows.some(r => r.name === column);
          if (!exists) {
            db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`, (alterErr) => {
              if (alterErr) console.error(`Migration error adding ${column} to ${table}:`, alterErr.message);
              else console.log(`Migrated: Added ${column} to ${table}`);
              resCol();
            });
          } else {
            resCol();
          }
        });
      });
    };

    Promise.all([
      addColumnIfMissing('users', 'avatar', 'TEXT'),
      addColumnIfMissing('users', 'preferred_currency', "TEXT DEFAULT 'USD'"),
      addColumnIfMissing('trips', 'budget', 'REAL DEFAULT 0'),
      addColumnIfMissing('trips', 'share_id', 'TEXT'),
      addColumnIfMissing('trips', 'is_public', 'INTEGER DEFAULT 0'),
      addColumnIfMissing('trips', 'updated_at', 'DATETIME'),
      addColumnIfMissing('expenses', 'expense_date', 'TEXT'),
      addColumnIfMissing('trip_activities', 'position', 'INTEGER DEFAULT 0')
    ]).then(resolve);
  });
}

function seedInitialData() {
  db.get('SELECT COUNT(*) as count FROM cities', [], (err, row) => {
    if (err || (row && row.count > 0)) {
      return; // Already seeded
    }

    console.log('Seeding initial cities and activities data...');

    const citiesData = [
      { name: 'Paris', country: 'France', region: 'Europe', cost_index: 8, popularity: 95, description: 'The City of Light, famous for its cafe culture and the Eiffel Tower.' },
      { name: 'Kyoto', country: 'Japan', region: 'Asia', cost_index: 7, popularity: 90, description: 'Former imperial capital known for classical Buddhist temples and gardens.' },
      { name: 'New York City', country: 'USA', region: 'North America', cost_index: 9, popularity: 98, description: 'The Big Apple, a global hub of finance, culture, and entertainment.' },
      { name: 'Bali', country: 'Indonesia', region: 'Asia', cost_index: 4, popularity: 92, description: 'Indonesian island known for its forested volcanic mountains and beaches.' },
      { name: 'Rome', country: 'Italy', region: 'Europe', cost_index: 7, popularity: 94, description: 'Capital of Italy, known for nearly 3,000 years of globally influential art.' },
      { name: 'Cape Town', country: 'South Africa', region: 'Africa', cost_index: 5, popularity: 85, description: 'A port city on South Africa\'s southwest coast, beneath Table Mountain.' },
      { name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', cost_index: 6, popularity: 88, description: 'Huge seaside city in Brazil, famed for its Copacabana and Ipanema beaches.' },
      { name: 'Sydney', country: 'Australia', region: 'Oceania', cost_index: 8, popularity: 89, description: 'Capital of New South Wales, best known for its harbourfront Opera House.' },
      { name: 'Dubai', country: 'UAE', region: 'Middle East', cost_index: 9, popularity: 91, description: 'City and emirate known for luxury shopping, ultramodern architecture.' },
      { name: 'Machu Picchu', country: 'Peru', region: 'South America', cost_index: 5, popularity: 87, description: 'Incan citadel set high in the Andes Mountains in Peru.' },
      { name: 'Santorini', country: 'Greece', region: 'Europe', cost_index: 7, popularity: 89, description: 'One of the Cyclades islands in the Aegean Sea, known for white cubiform houses.' },
      { name: 'Bangkok', country: 'Thailand', region: 'Asia', cost_index: 4, popularity: 93, description: 'Thailand\'s capital, known for ornate shrines and vibrant street life.' },
      { name: 'London', country: 'UK', region: 'Europe', cost_index: 9, popularity: 96, description: 'Capital of England and the UK, a 21st-century city with history.' },
      { name: 'Istanbul', country: 'Turkey', region: 'Europe/Asia', cost_index: 5, popularity: 86, description: 'A major city in Turkey that straddles Europe and Asia across the Bosphorus.' },
      { name: 'Banff', country: 'Canada', region: 'North America', cost_index: 7, popularity: 84, description: 'A resort town and one of Canada\'s most popular tourist destinations.' }
    ];

    const stmt = db.prepare('INSERT INTO cities (name, country, region, cost_index, popularity, description) VALUES (?, ?, ?, ?, ?, ?)');
    citiesData.forEach((c) => {
      stmt.run(c.name, c.country, c.region, c.cost_index, c.popularity, c.description);
    });
    stmt.finalize(() => {
      console.log('Seeded 15 initial cities.');
      seedActivities();
    });
  });
}

function seedActivities() {
  db.get('SELECT COUNT(*) as count FROM activities', [], (err, row) => {
    if (err || (row && row.count > 0)) {
      return;
    }

    db.all('SELECT id, name FROM cities', [], (err, cities) => {
      if (err || !cities) return;

      const cityMap = {};
      cities.forEach(c => cityMap[c.name] = c.id);

      const activitiesData = [
        { city_id: cityMap['Paris'], name: 'Eiffel Tower Tour', category: 'Sightseeing', description: 'Ascend the iconic tower for panoramic views of Paris.', duration: 2.5, cost: 30, location: 'Paris, France' },
        { city_id: cityMap['Paris'], name: 'Louvre Museum', category: 'Culture', description: 'See the Mona Lisa and thousands of other masterpieces.', duration: 4.0, cost: 20, location: 'Paris, France' },
        { city_id: cityMap['Kyoto'], name: 'Arashiyama Bamboo Grove', category: 'Nature', description: 'Walk through the serene bamboo forest.', duration: 2.0, cost: 0, location: 'Kyoto, Japan' },
        { city_id: cityMap['Bali'], name: 'Ubud Market Shopping', category: 'Shopping', description: 'Shop for local crafts, textiles, and spices.', duration: 3.0, cost: 50, location: 'Bali, Indonesia' },
        { city_id: cityMap['Rio de Janeiro'], name: 'Hang Gliding over Rio', category: 'Adventure', description: 'Thrill ride with views of Sugarloaf Mountain.', duration: 1.5, cost: 150, location: 'Rio de Janeiro, Brazil' },
        { city_id: cityMap['Bangkok'], name: 'Street Food Tour', category: 'Food', description: 'Taste authentic Pad Thai and local delicacies.', duration: 3.0, cost: 25, location: 'Bangkok, Thailand' },
        { city_id: cityMap['Machu Picchu'], name: 'Inca Trail Hike', category: 'Adventure', description: 'Hike the historic trail to the ruins.', duration: 8.0, cost: 80, location: 'Machu Picchu, Peru' },
        { city_id: cityMap['New York City'], name: 'Broadway Show', category: 'Culture', description: 'Enjoy a world-class theatrical performance.', duration: 3.0, cost: 120, location: 'New York City, USA' },
        { city_id: cityMap['Dubai'], name: 'Dubai Mall Experience', category: 'Shopping', description: 'Explore one of the world\'s largest shopping centers.', duration: 5.0, cost: 200, location: 'Dubai, UAE' }
      ];

      const stmt = db.prepare('INSERT INTO activities (city_id, name, category, description, duration, cost, location) VALUES (?, ?, ?, ?, ?, ?, ?)');
      activitiesData.forEach((a) => {
        stmt.run(a.city_id || null, a.name, a.category, a.description, a.duration, a.cost, a.location);
      });
      stmt.finalize(() => {
        console.log('Seeded 9 initial activities.');
      });
    });
  });
}

// Helper methods returning Promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll
};
