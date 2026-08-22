const { dbRun, dbGet, dbAll } = require('../database');

// POST /api/cities/:id/save
const saveCity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: cityId } = req.params;

    const existing = await dbGet('SELECT * FROM saved_destinations WHERE user_id = ? AND city_id = ?', [userId, cityId]);
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'City already saved',
        data: existing
      });
    }

    const result = await dbRun('INSERT INTO saved_destinations (user_id, city_id) VALUES (?, ?)', [userId, cityId]);
    const saved = await dbGet('SELECT * FROM saved_destinations WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'City saved to profile',
      data: saved
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cities/:id/save
const unsaveCity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: cityId } = req.params;
    await dbRun('DELETE FROM saved_destinations WHERE user_id = ? AND city_id = ?', [userId, cityId]);

    return res.status(200).json({
      success: true,
      message: 'City unsaved successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/profile/saved-cities
const getSavedCities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cities = await dbAll(
      `SELECT c.*, sd.created_at as saved_at 
       FROM saved_destinations sd 
       JOIN cities c ON sd.city_id = c.id 
       WHERE sd.user_id = ? 
       ORDER BY sd.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Saved destinations retrieved successfully',
      data: cities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveCity,
  unsaveCity,
  getSavedCities
};
