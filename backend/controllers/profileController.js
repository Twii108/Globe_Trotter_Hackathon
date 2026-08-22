const { dbRun, dbGet, dbAll } = require('../database');
const { getSavedCities } = require('./savedCitiesController');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await dbGet(
      'SELECT id, name, email, avatar, preferred_currency, travel_style, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          preferredCurrency: user.preferred_currency || 'USD',
          travelStyle: user.travel_style || 'Balanced Explorer',
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, avatar, preferred_currency, preferredCurrency, travel_style, travelStyle } = req.body;

    const currentUser = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        data: null
      });
    }

    const updatedName = name !== undefined ? name.trim() : currentUser.name;
    const updatedAvatar = avatar !== undefined ? avatar : currentUser.avatar;
    const updatedCurrency = preferred_currency || preferredCurrency || currentUser.preferred_currency || 'USD';
    const updatedTravelStyle = travel_style || travelStyle || currentUser.travel_style || 'Balanced Explorer';

    await dbRun(
      'UPDATE users SET name = ?, avatar = ?, preferred_currency = ?, travel_style = ? WHERE id = ?',
      [updatedName, updatedAvatar, updatedCurrency, updatedTravelStyle, userId]
    );

    const updatedUser = await dbGet(
      'SELECT id, name, email, avatar, preferred_currency, travel_style, created_at FROM users WHERE id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          preferredCurrency: updatedUser.preferred_currency,
          travelStyle: updatedUser.travel_style,
          created_at: updatedUser.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/profile (Delete User Account)
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await dbRun('DELETE FROM users WHERE id = ?', [userId]);
    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getSavedCities
};
