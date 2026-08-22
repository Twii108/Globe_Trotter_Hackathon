const crypto = require('crypto');
const { dbRun, dbGet, dbAll } = require('../database');

// POST /api/trips/:id/share
const generateShareLink = async (req, res, next) => {
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

    let shareId = trip.share_id;
    if (!shareId) {
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
        message: 'Shared trip not found or link has expired',
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

    // Sanitize output (read-only view)
    const readOnlyTrip = {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      start_date: trip.start_date,
      end_date: trip.end_date,
      cover_image: trip.cover_image,
      owner_name: trip.owner_name || 'GlobeTrotter Traveler',
      stops,
      activities
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

module.exports = {
  generateShareLink,
  getSharedTrip
};
