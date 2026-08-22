const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { deleteExpense } = require('../controllers/expenseController');

router.use(authMiddleware);

router.delete('/:id', deleteExpense);

module.exports = router;
