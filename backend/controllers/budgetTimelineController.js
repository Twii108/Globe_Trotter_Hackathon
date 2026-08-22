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

    const stops = await dbAll('SELECT * FROM stops WHERE trip_id = ? ORDER BY position ASC', [tripId]);
    const expenses = await dbAll('SELECT * FROM expenses WHERE trip_id = ?', [tripId]);
    const tripActivities = await dbAll('SELECT cost FROM trip_activities WHERE trip_id = ?', [tripId]);
    const transportSegments = await dbAll('SELECT * FROM transport_segments WHERE trip_id = ?', [tripId]);

    let durationDays = calculateDurationDays(trip.start_date, trip.end_date);
    if (stops.length > 0) {
      let calculatedDays = 0;
      stops.forEach(s => {
        if (s.start_date && s.end_date) {
          const d1 = new Date(s.start_date);
          const d2 = new Date(s.end_date);
          if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
            calculatedDays += Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
          } else {
            calculatedDays += 1;
          }
        } else {
          calculatedDays += 1;
        }
      });
      if (calculatedDays > 0) durationDays = calculatedDays;
    }

    const transportCost = transportSegments.length > 0
      ? transportSegments.reduce((sum, t) => sum + Number(t.cost || 0), 0)
      : (300 + Math.max(0, stops.length - 1) * 120);

    const stayCost = durationDays * 95;
    const mealCost = durationDays * 45;

    const activityCost = tripActivities.reduce((sum, ta) => sum + (Number(ta.cost) || 0), 0);

    const totalEstimated = transportCost + stayCost + activityCost + mealCost;
    const actualExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const effectiveSpending = actualExpenses > 0 ? actualExpenses : totalEstimated;
    const userBudget = Number(trip.budget) || 2500;
    const remainingBudget = userBudget - effectiveSpending;
    const percentageUsed = userBudget > 0 ? Number(((effectiveSpending / userBudget) * 100).toFixed(1)) : 0;
    const isOverBudget = effectiveSpending > userBudget;
    const avgDailyCost = Number((effectiveSpending / Math.max(1, durationDays)).toFixed(2));

    const categoryTotals = {
      Transport: transportCost,
      Accommodation: stayCost,
      Activities: activityCost,
      Meals: mealCost,
      Miscellaneous: 0
    };

    expenses.forEach(e => {
      const cat = e.category || 'Miscellaneous';
      let normalizedCat = 'Miscellaneous';
      if (cat.toLowerCase() === 'transport') normalizedCat = 'Transport';
      else if (cat.toLowerCase() === 'accommodation' || cat.toLowerCase() === 'stay') normalizedCat = 'Accommodation';
      else if (cat.toLowerCase() === 'activities' || cat.toLowerCase() === 'activity') normalizedCat = 'Activities';
      else if (cat.toLowerCase() === 'meals' || cat.toLowerCase() === 'meal' || cat.toLowerCase() === 'food') normalizedCat = 'Meals';
      categoryTotals[normalizedCat] = (categoryTotals[normalizedCat] || 0) + Number(e.amount || 0);
    });

    return {
      transport: transportCost,
      stay: stayCost,
      activities: activityCost,
      meals: mealCost,
      misc: categoryTotals.Miscellaneous || 0,
      totalEstimated,
      actualExpenses,
      effectiveSpending,
      userBudget,
      remainingBudget,
      percentageUsed,
      isOverBudget,
      avgDailyCost,
      durationDays,
      categoryTotals
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
  getTripTimeline,
  optimizeTripBudget,
  calculateBudgetLogic
};
