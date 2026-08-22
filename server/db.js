const { Pool } = require('pg');
const path = require('path');

let pool = null;
let usePg = true;
let sqliteDb = null;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter';

pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 2000
});

function getSqliteDb() {
  if (!sqliteDb) {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'dev_database.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
  }
  return sqliteDb;
}

function querySqlite(text, params = []) {
  return new Promise((resolve, reject) => {
    const db = getSqliteDb();
    
    let sqliteSql = text
      .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
      .replace(/TRUNCATE TABLE (\w+) RESTART IDENTITY CASCADE;/gi, 'DELETE FROM $1; DELETE FROM sqlite_sequence WHERE name=\'$1\';')
      .replace(/ILIKE/gi, 'LIKE')
      .replace(/RETURNING \*/gi, '')
      .replace(/RETURNING id, name, country, cost_index, popularity/gi, '')
      .replace(/RETURNING id, name, email/gi, '')
      .replace(/RETURNING id/gi, '');

    let paramIdx = 1;
    sqliteSql = sqliteSql.replace(/\$\d+/g, () => '?');

    const isSelect = /^\s*SELECT/i.test(sqliteSql);

    if (isSelect) {
      db.all(sqliteSql, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows: rows || [] });
      });
    } else {
      db.run(sqliteSql, params, function (err) {
        if (err) return reject(err);
        if (this.lastID) {
          db.get('SELECT * FROM cities WHERE id = ?', [this.lastID], (gErr, row) => {
            if (gErr || !row) resolve({ rows: [{ id: this.lastID }] });
            else resolve({ rows: [row] });
          });
        } else {
          resolve({ rows: [], rowCount: this.changes });
        }
      });
    }
  });
}

const query = async (text, params) => {
  if (usePg) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      if (
        err.code === 'ECONNREFUSED' ||
        err.code === 'ENOTFOUND' ||
        (err.message && err.message.includes('ECONNREFUSED'))
      ) {
        usePg = false;
        return querySqlite(text, params);
      }
      throw err;
    }
  } else {
    return querySqlite(text, params);
  }
};

module.exports = {
  query,
  pool
};
