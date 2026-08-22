const { dbRun, dbGet, dbAll } = require('../database');

// POST /api/trips/:id/stops
const createStop = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tripId } = req.params;
    const { city_id, city, start_date, end_date, position } = req.body;

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

    // Date validation: stop start >= trip start, stop end <= trip end, stop start <= stop end
    if (start_date && trip.start_date && start_date < trip.start_date) {
      return res.status(400).json({
        success: false,
        message: `Stop start date (${start_date}) cannot be earlier than trip start date (${trip.start_date})`,
        data: null
      });
    }

    if (end_date && trip.end_date && end_date > trip.end_date) {
      return res.status(400).json({
        success: false,
        message: `Stop end date (${end_date}) cannot be later than trip end date (${trip.end_date})`,
        data: null
      });
    }

    if (start_date && end_date && start_date > end_date) {
      return res.status(400).json({
        success: false,
        message: 'Stop start date cannot be later than stop end date',
        data: null
      });
    }

    let pos = position;
    if (pos === undefined || pos === null) {
      const maxPos = await dbGet('SELECT MAX(position) as max_pos FROM stops WHERE trip_id = ?', [tripId]);
      pos = maxPos && maxPos.max_pos !== null ? maxPos.max_pos + 1 : 0;
    }

    const result = await dbRun(
      'INSERT INTO stops (trip_id, city_id, city, start_date, end_date, position) VALUES (?, ?, ?, ?, ?, ?)',
      [tripId, city_id || null, city || null, start_date || null, end_date || null, pos]
    );

    const newStop = await dbGet('SELECT * FROM stops WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'Stop created successfully',
      data: newStop
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id/stops
const getTripStops = async (req, res, next) => {
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

    const stops = await dbAll('SELECT * FROM stops WHERE trip_id = ? ORDER BY position ASC', [tripId]);

    return res.status(200).json({
      success: true,
      message: 'Stops retrieved successfully',
      data: stops
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/stops/:id
const updateStop = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { city_id, city, start_date, end_date, position } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stop ID format',
        data: null
      });
    }

    const stop = await dbGet(
      `SELECT s.*, t.user_id, t.start_date as trip_start_date, t.end_date as trip_end_date 
       FROM stops s 
       JOIN trips t ON s.trip_id = t.id 
       WHERE s.id = ?`,
      [id]
    );

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found',
        data: null
      });
    }

    if (stop.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip stop',
        data: null
      });
    }

    const updatedStartDate = start_date !== undefined ? start_date : stop.start_date;
    const updatedEndDate = end_date !== undefined ? end_date : stop.end_date;

    if (updatedStartDate && stop.trip_start_date && updatedStartDate < stop.trip_start_date) {
      return res.status(400).json({
        success: false,
        message: `Stop start date cannot be earlier than trip start date (${stop.trip_start_date})`,
        data: null
      });
    }

    if (updatedEndDate && stop.trip_end_date && updatedEndDate > stop.trip_end_date) {
      return res.status(400).json({
        success: false,
        message: `Stop end date cannot be later than trip end date (${stop.trip_end_date})`,
        data: null
      });
    }

    const updatedCityId = city_id !== undefined ? city_id : stop.city_id;
    const updatedCity = city !== undefined ? city : stop.city;
    const updatedPosition = position !== undefined ? position : stop.position;

    await dbRun(
      'UPDATE stops SET city_id = ?, city = ?, start_date = ?, end_date = ?, position = ? WHERE id = ?',
      [updatedCityId, updatedCity, updatedStartDate, updatedEndDate, updatedPosition, id]
    );

    const updatedStop = await dbGet('SELECT * FROM stops WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Stop updated successfully',
      data: updatedStop
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trips/:id/stops/reorder
const reorderStops = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tripId } = req.params;
    const { stops } = req.body; // Can be array of { id, position } or array of stop objects/IDs

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

    if (Array.isArray(stops)) {
      for (let i = 0; i < stops.length; i++) {
        const item = stops[i];
        const stopId = typeof item === 'object' ? item.id : item;
        const newPos = typeof item === 'object' && item.position !== undefined ? item.position : i;

        if (stopId && !isNaN(stopId)) {
          await dbRun('UPDATE stops SET position = ? WHERE id = ? AND trip_id = ?', [newPos, stopId, tripId]);
        }
      }
    }

    const updatedStops = await dbAll('SELECT * FROM stops WHERE trip_id = ? ORDER BY position ASC', [tripId]);

    return res.status(200).json({
      success: true,
      message: 'Stops reordered successfully',
      data: updatedStops
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/stops/:id
const deleteStop = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stop ID format',
        data: null
      });
    }

    const stop = await dbGet(
      `SELECT s.*, t.user_id 
       FROM stops s 
       JOIN trips t ON s.trip_id = t.id 
       WHERE s.id = ?`,
      [id]
    );

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found',
        data: null
      });
    }

    if (stop.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip stop',
        data: null
      });
    }

    await dbRun('DELETE FROM stops WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Stop deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStop,
  getTripStops,
  updateStop,
  reorderStops,
  deleteStop
};
