const { dbRun, dbGet, dbAll } = require('../database');

// GET /api/trips/:id/transport
const getTripTransport = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
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
    const { id: tripId } = req.params;
    const { mode, departure_location, arrival_location, departure_time, arrival_time, cost } = req.body;

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
    const { id } = req.params;
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
