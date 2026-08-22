const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getSharedTrip, copySharedTrip } = require('../controllers/shareController');

// Public read-only endpoint for shared trip itineraries
router.get('/:shareId', getSharedTrip);

// Protected endpoint to copy a shared trip to current user's profile
router.post('/:shareId/copy', authMiddleware, copySharedTrip);

module.exports = router;
