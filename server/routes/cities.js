const express = require('express');
const City = require('../models/city');
const router = express.Router();

/**
 * GET /api/cities
 * Supports search parameters:
 *  - search: partial city name filter
 *  - country: partial country filter
 * Example: GET /api/cities?search=par&country=france
 */
router.get('/', async (req, res) => {
  try {
    const { search, country } = req.query;
    const cities = await City.getCities({ search, country });
    res.json(cities);
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.status(500).json({ error: 'Server error fetching cities' });
  }
});

/**
 * GET /api/cities/:id
 * Fetch a single city by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const city = await City.getCityById(req.params.id);
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    res.json(city);
  } catch (err) {
    console.error('Error fetching city by ID:', err);
    res.status(500).json({ error: 'Server error fetching city' });
  }
});

/**
 * POST /api/cities
 * Create a new city
 */
router.post('/', async (req, res) => {
  try {
    const { name, country, cost_index, popularity } = req.body;
    if (!name || !country || cost_index === undefined || popularity === undefined) {
      return res.status(400).json({ error: 'name, country, cost_index, and popularity are required' });
    }
    const newCity = await City.createCity({ name, country, cost_index, popularity });
    res.status(201).json(newCity);
  } catch (err) {
    console.error('Error creating city:', err);
    res.status(500).json({ error: 'Server error creating city' });
  }
});

module.exports = router;
