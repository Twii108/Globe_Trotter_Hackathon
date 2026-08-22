const { dbRun, dbGet, dbAll } = require('../database');

// GET /api/trips/:id/transport
const getTripTransport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tripId } = req.params;

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

    const segments = await dbAll('SELECT * FROM transport_segments WHERE trip_id = ? ORDER BY id ASC', [tripId]);
    return res.status(200).json({
      success: true,
      message: 'Transport segments retrieved successfully',
      data: segments
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips/:id/transport
const addTransportSegment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tripId } = req.params;
    const { mode, departure_location, arrival_location, departure_time, arrival_time, cost } = req.body;

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

    if (!mode) {
      return res.status(400).json({
        success: false,
        message: 'Transport mode is required',
        data: null
      });
    }

    const result = await dbRun(
      'INSERT INTO transport_segments (trip_id, mode, departure_location, arrival_location, departure_time, arrival_time, cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        tripId,
        mode,
        departure_location || '',
        arrival_location || '',
        departure_time || '',
        arrival_time || '',
        Number(cost) || 0
      ]
    );

    const newSegment = await dbGet('SELECT * FROM transport_segments WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'Transport segment added successfully',
      data: newSegment
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/transport/:id
const deleteTransportSegment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid segment ID format',
        data: null
      });
    }

    const segment = await dbGet('SELECT * FROM transport_segments WHERE id = ?', [id]);
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Transport segment not found',
        data: null
      });
    }

    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [segment.trip_id]);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found for transport segment',
        data: null
      });
    }

    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip transport segment',
        data: null
      });
    }

    await dbRun('DELETE FROM transport_segments WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Transport segment deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTripTransport,
  addTransportSegment,
  deleteTransportSegment
};
