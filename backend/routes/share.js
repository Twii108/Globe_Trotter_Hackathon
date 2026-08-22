const express = require('express');
const router = express.Router();
const { getSharedTrip } = require('../controllers/shareController');

// Public read-only endpoint for shared trip itineraries
router.get('/:shareId', getSharedTrip);

module.exports = router;
