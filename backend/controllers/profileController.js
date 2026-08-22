const { dbRun, dbGet } = require('../database');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await dbGet(
      'SELECT id, name, email, avatar, preferred_currency, created_at FROM users WHERE id = ?',
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
    const { name, avatar, preferred_currency, preferredCurrency } = req.body;

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

    await dbRun(
      'UPDATE users SET name = ?, avatar = ?, preferred_currency = ? WHERE id = ?',
      [updatedName, updatedAvatar, updatedCurrency, userId]
    );

    const updatedUser = await dbGet(
      'SELECT id, name, email, avatar, preferred_currency, created_at FROM users WHERE id = ?',
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
          created_at: updatedUser.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
