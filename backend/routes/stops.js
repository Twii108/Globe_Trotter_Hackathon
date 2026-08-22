const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { updateStop, deleteStop } = require('../controllers/stopController');

// All stop routes require authentication
router.use(authMiddleware);

router.put('/:id', updateStop);
router.delete('/:id', deleteStop);

module.exports = router;
