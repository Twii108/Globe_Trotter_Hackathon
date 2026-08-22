const { dbGet, dbAll } = require('../database');

// Helper to calculate days between start_date and end_date
const calculateDurationDays = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 1;
  const d1 = new Date(startDateStr);
  const d2 = new Date(endDateStr);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

// GET /api/trips/:id/budget
const getTripBudget = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
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

    // Security check: If authenticated, ensure ownership
    if (userId && trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip',
        data: null
      });
    }

    // Fetch logged expenses
    const expenses = await dbAll('SELECT category, amount FROM expenses WHERE trip_id = ?', [tripId]);

    // Fetch scheduled activities cost
    const tripActivities = await dbAll('SELECT cost FROM trip_activities WHERE trip_id = ?', [tripId]);

    let transport = 0;
    let stay = 0;
    let activities = 0;
    let meals = 0;

    expenses.forEach(e => {
      const cat = (e.category || '').toLowerCase();
      const amt = Number(e.amount) || 0;
      if (cat === 'transport') transport += amt;
      else if (cat === 'stay' || cat === 'accommodation') stay += amt;
      else if (cat === 'activity' || cat === 'activities') activities += amt;
      else if (cat === 'meal' || cat === 'meals' || cat === 'food') meals += amt;
      else activities += amt; // default bucket
    });

    tripActivities.forEach(ta => {
      activities += Number(ta.cost) || 0;
    });

    const total = transport + stay + activities + meals;
    const durationDays = calculateDurationDays(trip.start_date, trip.end_date);
    const averagePerDay = Math.round((total / durationDays) * 100) / 100;
    const overBudget = trip.budget > 0 ? total > trip.budget : false;

    return res.status(200).json({
      success: true,
      message: 'Trip budget calculated successfully',
      data: {
        transport,
        stay,
        activities,
        meals,
        total,
        averagePerDay,
        overBudget
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id/timeline
const getTripTimeline = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
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

    if (userId && trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this trip',
        data: null
      });
    }

    const stops = await dbAll('SELECT * FROM stops WHERE trip_id = ? ORDER BY position ASC', [tripId]);
    const activities = await dbAll(
      `SELECT ta.*, a.name as activity_name, a.category, a.location 
       FROM trip_activities ta 
       LEFT JOIN activities a ON ta.activity_id = a.id 
       WHERE ta.trip_id = ?`,
      [tripId]
    );
    const expenses = await dbAll('SELECT * FROM expenses WHERE trip_id = ? ORDER BY created_at ASC', [tripId]);

    const totalDays = calculateDurationDays(trip.start_date, trip.end_date);
    const timeline = [];
    const startDate = trip.start_date ? new Date(trip.start_date) : new Date();

    for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
      const currentDayDate = new Date(startDate);
      currentDayDate.setDate(currentDayDate.getDate() + dayIndex);
      const dateStr = currentDayDate.toISOString().split('T')[0];

      // Find active city stop for this date
      const activeStop = stops.find(s => {
        if (!s.start_date || !s.end_date) return false;
        return dateStr >= s.start_date && dateStr <= s.end_date;
      }) || stops[Math.min(dayIndex, stops.length - 1)];

      const dayActivities = activities.filter(a => a.scheduled_date === dateStr);
      const dayExpenses = expenses.filter(e => e.created_at && e.created_at.startsWith(dateStr));

      timeline.push({
        dayNumber: dayIndex + 1,
        date: dateStr,
        city: activeStop ? activeStop.city : trip.name,
        activities: dayActivities.map(a => ({
          id: a.id,
          name: a.custom_name || a.activity_name || 'Activity',
          category: a.category || 'General',
          scheduled_time: a.scheduled_time || '10:00 AM',
          cost: a.cost || 0,
          status: a.status || 'planned'
        })),
        expenses: dayExpenses.map(e => ({
          id: e.id,
          category: e.category,
          amount: e.amount,
          description: e.description
        }))
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip timeline generated successfully',
      data: {
        tripId: trip.id,
        tripName: trip.name,
        startDate: trip.start_date,
        endDate: trip.end_date,
        totalDays,
        timeline
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTripBudget,
  getTripTimeline
};
