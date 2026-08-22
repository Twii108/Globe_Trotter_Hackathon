const express = require('express');
const router = express.Router();
const { getAllCities, searchCities } = require('../controllers/cityController');

router.get('/search', searchCities);
router.get('/', getAllCities);

module.exports = router;
