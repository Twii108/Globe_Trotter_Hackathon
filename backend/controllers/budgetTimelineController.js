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

const calculateBudgetLogic = async (tripId, trip, userId = null) => {
    // Security check
    if (userId && trip.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this trip');
    }

    const expenses = await dbAll('SELECT category, amount FROM expenses WHERE trip_id = ?', [tripId]);
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
      else activities += amt;
    });

    tripActivities.forEach(ta => {
      activities += Number(ta.cost) || 0;
    });

    const total = transport + stay + activities + meals;
    const durationDays = calculateDurationDays(trip.start_date, trip.end_date);
    const averagePerDay = Math.round((total / durationDays) * 100) / 100;
    const overBudget = trip.budget > 0 ? total > trip.budget : false;

    return {
      transport,
      stay,
      activities,
      meals,
      total,
      averagePerDay,
      overBudget
    };
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

    let budgetData;
    try {
      budgetData = await calculateBudgetLogic(tripId, trip, userId);
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        return res.status(403).json({ success: false, message: err.message, data: null });
      }
      throw err;
    }

    return res.status(200).json({
      success: true,
      message: 'Trip budget calculated successfully',
      data: budgetData
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id/optimize-budget
const optimizeTripBudget = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { id: tripId } = req.params;

    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [tripId]);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found', data: null });

    let budgetData;
    try {
      budgetData = await calculateBudgetLogic(tripId, trip, userId);
    } catch (err) {
      if (err.message.includes('Unauthorized')) return res.status(403).json({ success: false, message: err.message, data: null });
      throw err;
    }

    // Check if there is a budget and if they need optimization
    if (trip.budget > 0 && budgetData.total <= trip.budget) {
       return res.status(200).json({
           success: true,
           message: 'Trip is already within budget.',
           data: { optimized: false, currentTotal: budgetData.total, targetBudget: trip.budget, suggestions: [] }
       });
    }

    let suggestions = [];
    let potentialSavings = 0;

    // Find activities scheduled that could be cheaper
    const scheduledActs = await dbAll(
        `SELECT ta.id, ta.activity_id, a.category, a.city_id, ta.cost, ta.custom_name, a.name 
         FROM trip_activities ta 
         JOIN activities a ON ta.activity_id = a.id 
         WHERE ta.trip_id = ?`, 
        [tripId]
    );

    for (const act of scheduledActs) {
        if (!act.category || !act.city_id) continue;
        
        // Query for cheaper activities in the same category and city
        const alternatives = await dbAll(
            `SELECT id, name, cost FROM activities 
             WHERE city_id = ? AND category = ? AND cost < ? 
             ORDER BY cost ASC LIMIT 1`,
            [act.city_id, act.category, act.cost]
        );

        if (alternatives.length > 0) {
            const bestAlt = alternatives[0];
            const savings = act.cost - bestAlt.cost;
            suggestions.push({
                type: "Activity",
                description: `Replace '${act.custom_name || act.name}' with '${bestAlt.name}'`,
                currentCost: act.cost,
                newCost: bestAlt.cost,
                saving: savings
            });
            potentialSavings += savings;
        }
    }

    // Suggestion 2: Reduce accommodation cost
    const staySavings = budgetData.stay * 0.20; // Suggest 20% reduction
    if (staySavings > 0) {
        suggestions.push({
            type: "Accommodation",
            description: "Choose budget accommodation or hostels instead of standard hotels",
            currentCost: budgetData.stay,
            newCost: budgetData.stay - staySavings,
            saving: staySavings
        });
        potentialSavings += staySavings;
    }

    return res.status(200).json({
      success: true,
      message: 'Budget optimization generated',
      data: {
          optimized: true,
          currentTotal: budgetData.total,
          targetBudget: trip.budget,
          potentialTotalSaving: potentialSavings,
          suggestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id/health
const getTripHealth = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { id: tripId } = req.params;

    const trip = await dbGet('SELECT * FROM trips WHERE id = ?', [tripId]);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found', data: null });

    if (userId && trip.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized', data: null });
    }

    const stops = await dbAll('SELECT * FROM stops WHERE trip_id = ? ORDER BY start_date ASC', [tripId]);
    const activities = await dbAll('SELECT * FROM trip_activities WHERE trip_id = ?', [tripId]);
    
    let budgetData;
    try {
      budgetData = await calculateBudgetLogic(tripId, trip, userId);
    } catch (e) {
      budgetData = { overBudget: false, total: 0, effectiveSpending: 0, userBudget: 0, remainingBudget: 0 };
    }

    let score = 100;
    const deductions = [];
    const conflicts = [];

    // Validation 1: Date overlaps and invalid dates
    stops.forEach((stop, idx) => {
      if (trip.start_date && stop.start_date < trip.start_date) {
        conflicts.push(`Stop "${stop.city}" starts before the trip begins.`);
      }
      if (trip.end_date && stop.end_date > trip.end_date) {
        conflicts.push(`Stop "${stop.city}" ends after the trip ends.`);
      }
      if (stop.start_date > stop.end_date) {
        conflicts.push(`Stop "${stop.city}" end date is earlier than start date.`);
      }
      if (idx > 0) {
        const prevStop = stops[idx - 1];
        if (stop.start_date < prevStop.end_date) {
          conflicts.push(`Stop "${stop.city}" overlaps with previous stop "${prevStop.city}".`);
        }
      }
    });

    // Validation 2: Missing activities
    if (stops.length === 0) {
      score -= 20;
      deductions.push('No destination cities/stops added yet.');
    } else {
      const emptyStops = stops.filter(s => {
        const stopActs = activities.filter(a => a.stop_id === s.id);
        return stopActs.length === 0;
      });
      if (emptyStops.length > 0) {
        score -= 10;
        deductions.push(`${emptyStops.length} stop(s) have no planned activities.`);
      }
    }

    // Validation 3: Budget overflow
    if (trip.budget > 0 && budgetData.total > trip.budget) {
      score -= 15;
      deductions.push(`Trip estimated cost exceeds budget by ${budgetData.total - trip.budget}.`);
      conflicts.push(`Trip estimated cost exceeds target budget.`);
    }

    if (conflicts.length > 0) {
      score -= Math.min(40, conflicts.length * 10);
      deductions.push(`${conflicts.length} itinerary conflict(s) or date overlaps detected.`);
    }

    if (!trip.cover_image) {
      score -= 5;
      deductions.push('Missing cover image photo.');
    }

    score = Math.max(0, Math.min(100, score));

    let status = 'Excellent';
    if (score < 50) status = 'Needs Attention';
    else if (score < 80) status = 'Good';

    return res.status(200).json({
      success: true,
      message: 'Trip health calculated',
      data: { score, status, deductions, conflicts }
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
  getTripHealth,
  getTripTimeline,
  optimizeTripBudget
};
