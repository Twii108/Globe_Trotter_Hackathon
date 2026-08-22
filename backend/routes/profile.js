const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, updateProfile, deleteAccount, getSavedCities } = require('../controllers/profileController');

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);
router.delete('/', deleteAccount);
router.get('/saved-cities', getSavedCities);

module.exports = router;
