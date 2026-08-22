const { dbRun, dbGet, dbAll } = require('../database');

// POST /api/trips
const createTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, start_date, end_date, cover_image } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Trip name is required',
        data: null
      });
    }

    const result = await dbRun(
      'INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        name.trim(),
        description || '',
        start_date || null,
        end_date || null,
        cover_image || null
      ]
    );

    const newTrip = await dbGet('SELECT * FROM trips WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: newTrip
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips
const getUserTrips = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trips = await dbAll('SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    // Attach stops for each trip
    for (let trip of trips) {
      const stops = await dbAll(
        `SELECT s.*, c.lat, c.lng 
         FROM stops s 
         LEFT JOIN cities c ON s.city_id = c.id 
         WHERE s.trip_id = ? 
         ORDER BY s.position ASC`,
        [trip.id]
      );
      const activities = await dbAll(
        `SELECT ta.*, a.name as activity_name, a.category, a.location 
         FROM trip_activities ta 
         LEFT JOIN activities a ON ta.activity_id = a.id 
         WHERE ta.trip_id = ?`,
        [trip.id]
      );
      trip.stops = stops;
      trip.activities = activities;
    }

    return res.status(200).json({
      success: true,
      message: 'Trips retrieved successfully',
      data: trips
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id
const getTripById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format',
        data: null
      });
    }

    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [id]);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
        data: null
      });
    }

    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip',
        data: null
      });
    }

    const stops = await dbAll(
      `SELECT s.*, c.lat, c.lng 
       FROM stops s 
       LEFT JOIN cities c ON s.city_id = c.id 
       WHERE s.trip_id = ? 
       ORDER BY s.position ASC`,
      [trip.id]
    );
    const activities = await dbAll(
      `SELECT ta.*, a.name as activity_name, a.category, a.location 
       FROM trip_activities ta 
       LEFT JOIN activities a ON ta.activity_id = a.id 
       WHERE ta.trip_id = ?`,
      [trip.id]
    );

    trip.stops = stops;
    trip.activities = activities;

    return res.status(200).json({
      success: true,
      message: 'Trip details retrieved successfully',
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trips/:id
const updateTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, start_date, end_date, cover_image } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format',
        data: null
      });
    }

    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [id]);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
        data: null
      });
    }

    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip',
        data: null
      });
    }

    const updatedName = name !== undefined ? name : trip.name;
    const updatedDescription = description !== undefined ? description : trip.description;
    const updatedStartDate = start_date !== undefined ? start_date : trip.start_date;
    const updatedEndDate = end_date !== undefined ? end_date : trip.end_date;
    const updatedCoverImage = cover_image !== undefined ? cover_image : trip.cover_image;

    await dbRun(
      'UPDATE trips SET name = ?, description = ?, start_date = ?, end_date = ?, cover_image = ? WHERE id = ?',
      [updatedName, updatedDescription, updatedStartDate, updatedEndDate, updatedCoverImage, id]
    );

    const updatedTrip = await dbGet('SELECT * FROM trips WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: updatedTrip
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trips/:id
const deleteTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format',
        data: null
      });
    }

    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [id]);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
        data: null
      });
    }

    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip',
        data: null
      });
    }

    await dbRun('DELETE FROM trips WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip
};
