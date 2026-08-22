const { dbRun, dbGet, dbAll } = require('../database');

// GET /api/activities
const getAllActivities = async (req, res, next) => {
  try {
    const { city_id, category } = req.query;

    let sql = 'SELECT a.*, c.name as city_name, c.country FROM activities a LEFT JOIN cities c ON a.city_id = c.id';
    const params = [];
    const conditions = [];

    if (city_id) {
      conditions.push('a.city_id = ?');
      params.push(city_id);
    }

    if (category) {
      conditions.push('LOWER(a.category) = LOWER(?)');
      params.push(category);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY a.name ASC';

    const activities = await dbAll(sql, params);

    return res.status(200).json({
      success: true,
      message: 'Activities retrieved successfully',
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/activities/:id
const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format',
        data: null
      });
    }

    const activity = await dbGet(
      'SELECT a.*, c.name as city_name, c.country FROM activities a LEFT JOIN cities c ON a.city_id = c.id WHERE a.id = ?',
      [id]
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Activity details retrieved successfully',
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips/:id/activities
const addTripActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tripId } = req.params;
    const { activity_id, stop_id, custom_name, scheduled_date, scheduled_time, cost } = req.body;

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

    let defaultCost = cost;
    if (activity_id && (defaultCost === undefined || defaultCost === null)) {
      const act = await dbGet('SELECT cost FROM activities WHERE id = ?', [activity_id]);
      if (act) defaultCost = act.cost;
    }

    const result = await dbRun(
      'INSERT INTO trip_activities (trip_id, stop_id, activity_id, custom_name, scheduled_date, scheduled_time, cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        tripId,
        stop_id || null,
        activity_id || null,
        custom_name || null,
        scheduled_date || null,
        scheduled_time || null,
        defaultCost || 0
      ]
    );

    const newTripActivity = await dbGet(
      `SELECT ta.*, a.name as activity_name, a.category, a.location 
       FROM trip_activities ta 
       LEFT JOIN activities a ON ta.activity_id = a.id 
       WHERE ta.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      success: true,
      message: 'Activity added to trip successfully',
      data: newTripActivity
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trips/:id/activities/:activityId
const removeTripActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tripId, activityId } = req.params;

    if (isNaN(tripId) || isNaN(activityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
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

    const tripAct = await dbGet('SELECT * FROM trip_activities WHERE id = ? AND trip_id = ?', [activityId, tripId]);
    if (!tripAct) {
      return res.status(404).json({
        success: false,
        message: 'Trip activity record not found',
        data: null
      });
    }

    await dbRun('DELETE FROM trip_activities WHERE id = ? AND trip_id = ?', [activityId, tripId]);

    return res.status(200).json({
      success: true,
      message: 'Activity removed from trip successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllActivities,
  getActivityById,
  addTripActivity,
  removeTripActivity
};
