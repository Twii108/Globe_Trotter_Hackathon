const { dbRun, dbGet, dbAll } = require('../database');

// Allowed categories
const ALLOWED_CATEGORIES = ['transport', 'stay', 'activity', 'meal'];

// POST /api/trips/:id/expenses
const addExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tripId } = req.params;
    const { category, amount, description } = req.body;

    if (isNaN(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format',
        data: null
      });
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
        data: null
      });
    }

    if (amount === undefined || amount === null || isNaN(amount) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
        data: null
      });
    }

    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [tripId]);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
        data: null
      });
    }

    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip',
        data: null
      });
    }

    const result = await dbRun(
      'INSERT INTO expenses (trip_id, category, amount, description) VALUES (?, ?, ?, ?)',
      [tripId, category.toLowerCase(), Number(amount), description || '']
    );

    const newExpense = await dbGet('SELECT * FROM expenses WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: newExpense
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id/expenses
const getTripExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tripId } = req.params;

    if (isNaN(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format',
        data: null
      });
    }

    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [tripId]);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
        data: null
      });
    }

    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip',
        data: null
      });
    }

    const expenses = await dbAll('SELECT * FROM expenses WHERE trip_id = ? ORDER BY created_at DESC', [tripId]);

    return res.status(200).json({
      success: true,
      message: 'Expenses retrieved successfully',
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format',
        data: null
      });
    }

    const expense = await dbGet(
      `SELECT e.*, t.user_id 
       FROM expenses e 
       JOIN trips t ON e.trip_id = t.id 
       WHERE e.id = ?`,
      [id]
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
        data: null
      });
    }

    if (expense.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip expense',
        data: null
      });
    }

    await dbRun('DELETE FROM expenses WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addExpense,
  getTripExpenses,
  deleteExpense
};
