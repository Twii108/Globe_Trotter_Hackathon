const { dbAll } = require('../database');

// GET /api/cities
const getAllCities = async (req, res, next) => {
  try {
    const cities = await dbAll('SELECT * FROM cities ORDER BY popularity DESC, name ASC');

    return res.status(200).json({
      success: true,
      message: 'Cities retrieved successfully',
      data: cities
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cities/search?q=paris
const searchCities = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      const cities = await dbAll('SELECT * FROM cities ORDER BY popularity DESC, name ASC');
      return res.status(200).json({
        success: true,
        message: 'Cities retrieved successfully',
        data: cities
      });
    }

    const searchTerm = `%${q.trim().toLowerCase()}%`;
    const cities = await dbAll(
      `SELECT * FROM cities 
       WHERE LOWER(name) LIKE ? OR LOWER(country) LIKE ? OR LOWER(region) LIKE ? 
       ORDER BY popularity DESC, name ASC`,
      [searchTerm, searchTerm, searchTerm]
    );

    return res.status(200).json({
      success: true,
      message: `Search results for '${q}'`,
      data: cities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCities,
  searchCities
};
