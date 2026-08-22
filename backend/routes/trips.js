const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');
const {
  createStop,
  getTripStops
} = require('../controllers/stopController');
const {
  addTripActivity,
  removeTripActivity
} = require('../controllers/activityController');

// All trip routes require authentication
router.use(authMiddleware);

// Trip CRUD
router.post('/', createTrip);
router.get('/', getUserTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Nested Trip Stops
router.post('/:id/stops', createStop);
router.get('/:id/stops', getTripStops);

// Nested Trip Activities
router.post('/:id/activities', addTripActivity);
router.delete('/:id/activities/:activityId', removeTripActivity);

module.exports = router;
