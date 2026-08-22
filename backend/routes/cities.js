const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAllCities, searchCities } = require('../controllers/cityController');
const { saveCity, unsaveCity } = require('../controllers/savedCitiesController');

router.get('/search', searchCities);
router.get('/', getAllCities);

// Protected Save City routes
router.post('/:id/save', authMiddleware, saveCity);
router.delete('/:id/save', authMiddleware, unsaveCity);

module.exports = router;
