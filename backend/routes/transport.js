const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { deleteTransportSegment } = require('../controllers/transportController');

router.use(authMiddleware);

// DELETE /api/transport/:id
router.delete('/:id', deleteTransportSegment);

module.exports = router;
