const { dbRun, dbGet, dbAll } = require('../database');

// POST /api/trips
const createTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, start_date, end_date, budget, cover_image } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Trip name is required',
        data: null
      });
    }

    if (start_date && end_date && start_date > end_date) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
        data: null
      });
    }

    if (budget !== undefined && Number(budget) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget cannot be negative',
        data: null
      });
    }

    const result = await dbRun(
      'INSERT INTO trips (user_id, name, description, start_date, end_date, budget, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        name.trim(),
        description || '',
        start_date || null,
        end_date || null,
        Number(budget) || 0,
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
    const { name, description, start_date, end_date, budget, cover_image } = req.body;

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

    const updatedStartDate = start_date !== undefined ? start_date : trip.start_date;
    const updatedEndDate = end_date !== undefined ? end_date : trip.end_date;

    if (updatedStartDate && updatedEndDate && updatedStartDate > updatedEndDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
        data: null
      });
    }

    const updatedName = name !== undefined ? name.trim() : trip.name;
    const updatedDescription = description !== undefined ? description : trip.description;
    const updatedBudget = budget !== undefined ? Number(budget) : trip.budget;
    const updatedCoverImage = cover_image !== undefined ? cover_image : trip.cover_image;

    await dbRun(
      'UPDATE trips SET name = ?, description = ?, start_date = ?, end_date = ?, budget = ?, cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [updatedName, updatedDescription, updatedStartDate, updatedEndDate, updatedBudget, updatedCoverImage, id]
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

// POST /api/trips/:id/duplicate
const duplicateTrip = async (req, res, next) => {
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

    const originalTrip = await dbGet('SELECT * FROM trips WHERE id = ?', [id]);
    if (!originalTrip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
        data: null
      });
    }

    if (originalTrip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip',
        data: null
      });
    }

    // Insert duplicate trip
    const tripRes = await dbRun(
      'INSERT INTO trips (user_id, name, description, start_date, end_date, budget, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        `Copy of ${originalTrip.name}`,
        originalTrip.description || '',
        originalTrip.start_date || null,
        originalTrip.end_date || null,
        originalTrip.budget || 0,
        originalTrip.cover_image || null
      ]
    );
    const newTripId = tripRes.lastID;

    // Copy stops
    const stops = await dbAll('SELECT * FROM stops WHERE trip_id = ? ORDER BY position ASC', [originalTrip.id]);
    const stopIdMap = {};

    for (let s of stops) {
      const stopRes = await dbRun(
        'INSERT INTO stops (trip_id, city_id, city, start_date, end_date, position) VALUES (?, ?, ?, ?, ?, ?)',
        [newTripId, s.city_id || null, s.city, s.start_date, s.end_date, s.position || 0]
      );
      stopIdMap[s.id] = stopRes.lastID;
    }

    // Copy activities
    const activities = await dbAll('SELECT * FROM trip_activities WHERE trip_id = ?', [originalTrip.id]);
    for (let a of activities) {
      const newStopId = a.stop_id ? stopIdMap[a.stop_id] || null : null;
      await dbRun(
        'INSERT INTO trip_activities (trip_id, stop_id, activity_id, custom_name, scheduled_date, scheduled_time, cost, status, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newTripId, newStopId, a.activity_id || null, a.custom_name, a.scheduled_date, a.scheduled_time, a.cost || 0, a.status || 'planned', a.position || 0]
      );
    }

    // Copy transport segments
    const transportSegments = await dbAll('SELECT * FROM transport_segments WHERE trip_id = ?', [originalTrip.id]);
    for (let t of transportSegments) {
      await dbRun(
        'INSERT INTO transport_segments (trip_id, mode, departure_location, arrival_location, departure_time, arrival_time, cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newTripId, t.mode, t.departure_location, t.arrival_location, t.departure_time, t.arrival_time, t.cost || 0]
      );
    }

    const newTrip = await dbGet('SELECT * FROM trips WHERE id = ?', [newTripId]);
    const newStops = await dbAll('SELECT * FROM stops WHERE trip_id = ? ORDER BY position ASC', [newTripId]);
    const newActivities = await dbAll('SELECT * FROM trip_activities WHERE trip_id = ?', [newTripId]);
    newTrip.stops = newStops;
    newTrip.activities = newActivities;

    return res.status(201).json({
      success: true,
      message: 'Trip duplicated successfully',
      data: newTrip
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
  duplicateTrip,
  deleteTrip
};
