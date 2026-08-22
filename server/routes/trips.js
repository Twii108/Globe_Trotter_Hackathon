const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const Trip = require('../models/trip');

// POST /api/trips - create trip for req.user.id
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, start_date, end_date, description, cover_photo_url } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Trip name is required' });
    }

    const userId = req.user.id;
    const newTrip = await Trip.create({
      user_id: userId,
      name,
      start_date,
      end_date,
      description,
      cover_photo_url
    });

    return res.status(201).json(newTrip);
  } catch (error) {
    console.error('Error creating trip:', error);
    return res.status(500).json({ error: 'Server error while creating trip' });
  }
});

// GET /api/trips - list trips for req.user.id
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const trips = await Trip.findByUserId(userId);
    return res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({ error: 'Server error while fetching trips' });
  }
});

module.exports = router;
