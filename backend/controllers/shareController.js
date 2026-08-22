const crypto = require('crypto');
const { dbRun, dbGet, dbAll } = require('../database');

// POST /api/trips/:id/share (Toggle sharing or regenerate link)
const generateShareLink = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tripId } = req.params;
    const { enable } = req.body;

    if (isNaN(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format',
        data: null
      });
    }

    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [tripId]);
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

    // If explicit disable request:
    if (enable === false) {
      await dbRun('UPDATE trips SET is_public = 0, share_id = NULL WHERE id = ?', [tripId]);
      return res.status(200).json({
        success: true,
        message: 'Public sharing disabled successfully',
        data: { tripId: trip.id, isPublic: false }
      });
    }

    let shareId = trip.share_id;
    if (!shareId || enable === true) {
      shareId = 'sh_' + crypto.randomBytes(8).toString('hex');
      await dbRun('UPDATE trips SET share_id = ?, is_public = 1 WHERE id = ?', [shareId, tripId]);
    } else {
      await dbRun('UPDATE trips SET is_public = 1 WHERE id = ?', [tripId]);
    }

    return res.status(200).json({
      success: true,
      message: 'Public share link generated successfully',
      data: {
        tripId: trip.id,
        shareId: shareId,
        shareUrl: `/api/shared/${shareId}`
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/shared/:shareId (Public Read-Only Endpoint)
const getSharedTrip = async (req, res, next) => {
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: 'Share ID is required',
        data: null
      });
    }

    const trip = await dbGet(
      `SELECT t.*, u.name as owner_name 
       FROM trips t 
       LEFT JOIN users u ON t.user_id = u.id 
       WHERE t.share_id = ? AND t.is_public = 1`,
      [shareId]
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Shared trip not found or public sharing has been disabled',
        data: null
      });
    }

    const stops = await dbAll('SELECT * FROM stops WHERE trip_id = ? ORDER BY position ASC', [trip.id]);
    const activities = await dbAll(
      `SELECT ta.*, a.name as activity_name, a.category, a.location 
       FROM trip_activities ta 
       LEFT JOIN activities a ON ta.activity_id = a.id 
       WHERE ta.trip_id = ?`,
      [trip.id]
    );
    const transportSegments = await dbAll('SELECT * FROM transport_segments WHERE trip_id = ?', [trip.id]);

    // Sanitize output (read-only view)
    const readOnlyTrip = {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      start_date: trip.start_date,
      end_date: trip.end_date,
      budget: trip.budget,
      cover_image: trip.cover_image,
      share_id: trip.share_id,
      owner_name: trip.owner_name || 'GlobeTrotter Traveler',
      stops,
      activities,
      transportSegments
    };

    return res.status(200).json({
      success: true,
      message: 'Shared read-only trip itinerary retrieved successfully',
      data: readOnlyTrip
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/shared/:shareId/copy (Duplicate shared public trip to user profile)
const copySharedTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shareId } = req.params;

    const originalTrip = await dbGet('SELECT * FROM trips WHERE share_id = ? AND is_public = 1', [shareId]);
    if (!originalTrip) {
      return res.status(404).json({
        success: false,
        message: 'Shared trip not found or sharing disabled',
        data: null
      });
    }

    // Insert duplicated trip
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

    return res.status(201).json({
      success: true,
      message: 'Trip duplicated successfully',
      data: newTrip
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateShareLink,
  getSharedTrip,
  copySharedTrip
};
