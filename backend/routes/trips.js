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
  getTripStops,
  reorderStops
} = require('../controllers/stopController');

const {
  addTripActivity,
  removeTripActivity
} = require('../controllers/activityController');

const {
  getTripBudget,
  getTripTimeline
} = require('../controllers/budgetTimelineController');

const {
  addExpense,
  getTripExpenses
} = require('../controllers/expenseController');

const {
  generateShareLink
} = require('../controllers/shareController');

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
router.put('/:id/stops/reorder', reorderStops);

// Nested Trip Activities
router.post('/:id/activities', addTripActivity);
router.delete('/:id/activities/:activityId', removeTripActivity);

// Budget & Timeline
router.get('/:id/budget', getTripBudget);
router.get('/:id/timeline', getTripTimeline);

// Expenses
router.post('/:id/expenses', addExpense);
router.get('/:id/expenses', getTripExpenses);

// Public Share Link Generation
router.post('/:id/share', generateShareLink);

module.exports = router;
