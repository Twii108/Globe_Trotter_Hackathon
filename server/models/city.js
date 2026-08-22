const db = require('../db');

/**
 * Get cities with optional partial search filtering by name and/or country.
 * @param {Object} [filters]
 * @param {string} [filters.search] - Partial city name filter
 * @param {string} [filters.country] - Partial country filter
 * @returns {Promise<Array>} List of city objects
 */
const getCities = async ({ search, country } = {}) => {
  let queryText = 'SELECT id, name, country, cost_index, popularity FROM cities';
  const queryParams = [];
  const conditions = [];

  if (search && typeof search === 'string' && search.trim() !== '') {
    queryParams.push(`%${search.trim()}%`);
    conditions.push(`name ILIKE $${queryParams.length}`);
  }

  if (country && typeof country === 'string' && country.trim() !== '') {
    queryParams.push(`%${country.trim()}%`);
    conditions.push(`country ILIKE $${queryParams.length}`);
  }

  if (conditions.length > 0) {
    queryText += ' WHERE ' + conditions.join(' AND ');
  }

  queryText += ' ORDER BY popularity DESC, name ASC';

  const result = await db.query(queryText, queryParams);
  return result.rows;
};

/**
 * Get a single city by ID.
 * @param {number|string} id 
 * @returns {Promise<Object|null>} City object or null if not found
 */
const getCityById = async (id) => {
  const result = await db.query(
    'SELECT id, name, country, cost_index, popularity FROM cities WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Create a new city record.
 * @param {Object} cityData
 * @param {string} cityData.name
 * @param {string} cityData.country
 * @param {number} cityData.cost_index
 * @param {number} cityData.popularity
 * @returns {Promise<Object>} Created city object
 */
const createCity = async ({ name, country, cost_index, popularity }) => {
  const result = await db.query(
    'INSERT INTO cities (name, country, cost_index, popularity) VALUES ($1, $2, $3, $4) RETURNING id, name, country, cost_index, popularity',
    [name, country, cost_index, popularity]
  );
  return result.rows[0];
};

/**
 * Update an existing city record.
 * @param {number|string} id
 * @param {Object} cityData
 * @returns {Promise<Object|null>} Updated city object or null
 */
const updateCity = async (id, { name, country, cost_index, popularity }) => {
  const result = await db.query(
    'UPDATE cities SET name = $1, country = $2, cost_index = $3, popularity = $4 WHERE id = $5 RETURNING id, name, country, cost_index, popularity',
    [name, country, cost_index, popularity, id]
  );
  return result.rows[0] || null;
};

/**
 * Delete a city record by ID.
 * @param {number|string} id
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
const deleteCity = async (id) => {
  const result = await db.query('DELETE FROM cities WHERE id = $1 RETURNING id', [id]);
  return (result.rows && result.rows.length > 0) || (result.rowCount && result.rowCount > 0);
};

module.exports = {
  getCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity
};
