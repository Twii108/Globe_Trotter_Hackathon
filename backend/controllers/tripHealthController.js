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

// GET /api/trips/:id/health
const getTripHealth = async (req, res, next) => {
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

    const stops = await dbAll('SELECT * FROM stops WHERE trip_id = ? ORDER BY position ASC', [tripId]);
    const tripActivities = await dbAll(
      `SELECT ta.*, a.name as activity_name, a.category, a.city_id
       FROM trip_activities ta
       LEFT JOIN activities a ON ta.activity_id = a.id
       WHERE ta.trip_id = ?`,
      [tripId]
    );
    const expenses = await dbAll('SELECT * FROM expenses WHERE trip_id = ?', [tripId]);
    const transportSegments = await dbAll('SELECT * FROM transport_segments WHERE trip_id = ?', [tripId]);

    const conflicts = [];
    const deductions = [];

    // --- 1. DATES & SCHEDULE VALIDATION ---
    let scheduleScore = 100;
    let datesValid = true;

    stops.forEach((stop, idx) => {
      if (trip.start_date && stop.start_date < trip.start_date) {
        conflicts.push(`Stop "${stop.city}" start date (${stop.start_date}) is before trip start date (${trip.start_date}).`);
        datesValid = false;
      }
      if (trip.end_date && stop.end_date > trip.end_date) {
        conflicts.push(`Stop "${stop.city}" end date (${stop.end_date}) is after trip end date (${trip.end_date}).`);
        datesValid = false;
      }
      if (stop.start_date > stop.end_date) {
        conflicts.push(`Stop "${stop.city}" end date cannot be earlier than start date.`);
        datesValid = false;
      }
      if (idx > 0) {
        const prevStop = stops[idx - 1];
        if (stop.start_date < prevStop.end_date) {
          conflicts.push(`Stop "${stop.city}" overlaps with previous stop "${prevStop.city}".`);
          datesValid = false;
        }
      }
    });

    if (!datesValid) {
      scheduleScore -= 30;
      deductions.push('Invalid dates or stop overlap structure detected.');
    }

    // --- 2. BUDGET HEALTH ---
    let budgetScore = 100;
    // Centralized budget estimation logic duplicated here or imported:
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
    const userBudget = Number(trip.budget) || 0;

    if (userBudget > 0 && effectiveSpending > userBudget) {
      budgetScore -= 20;
      deductions.push('Trip estimated/logged expenses exceed target budget.');
      conflicts.push(`Trip estimated cost ($${effectiveSpending}) exceeds target budget ($${userBudget}) by $${(effectiveSpending - userBudget).toFixed(2)}.`);
    }

    // --- 3. ACTIVITY COMPLETENESS ---
    let activitiesScore = 100;
    let hasActivities = false;
    let missingActivities = false;

    if (stops.length > 0) {
      stops.forEach(stop => {
        const stopActs = tripActivities.filter(a => String(a.stop_id) === String(stop.id));
        if (stopActs.length > 0) {
          hasActivities = true;
        } else {
          missingActivities = true;
        }
      });
    } else {
      missingActivities = true;
    }

    if (stops.length === 0) {
      activitiesScore -= 20;
      deductions.push('No destination cities/stops added yet.');
    } else if (!hasActivities) {
      activitiesScore -= 15;
      deductions.push('No activities planned in any stop.');
    } else if (missingActivities) {
      activitiesScore -= 5;
      deductions.push('Some destination stops have no planned activities.');
    }

    // --- 4. PACING & TRAVEL TIME GAPS ---
    let travelTimeScore = 100;
    const cityCount = stops.length;
    let rushedSchedule = false;

    if (cityCount > 0 && durationDays / cityCount < 1.5) {
      travelTimeScore -= 10;
      rushedSchedule = true;
      deductions.push('Rushed schedule (too many cities, too few days).');
    }

    // Activity conflict checking
    let overlapCount = 0;
    stops.forEach(stop => {
      const stopActs = tripActivities.filter(a => String(a.stop_id) === String(stop.id))
        .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));

      stopActs.forEach((act, idx) => {
        // Date bounds
        if (stop.start_date && act.scheduled_date && act.scheduled_date < stop.start_date) {
          conflicts.push(`Activity "${act.custom_name || act.activity_name}" date (${act.scheduled_date}) is before stop start date (${stop.start_date}).`);
        }
        if (stop.end_date && act.scheduled_date && act.scheduled_date > stop.end_date) {
          conflicts.push(`Activity "${act.custom_name || act.activity_name}" date (${act.scheduled_date}) is after stop end date (${stop.end_date}).`);
        }

        // Overlapping consecutive activities
        if (idx > 0) {
          const prevAct = stopActs[idx - 1];
          if (prevAct.scheduled_date === act.scheduled_date && prevAct.scheduled_time && act.scheduled_time) {
            if (prevAct.scheduled_time === act.scheduled_time) {
              conflicts.push(`Activity "${act.custom_name || act.activity_name}" overlaps with "${prevAct.custom_name || prevAct.activity_name}" at ${act.scheduled_time}.`);
              overlapCount++;
            }
          }
        }
      });
    });

    if (overlapCount > 0) {
      travelTimeScore -= Math.min(40, overlapCount * 10);
      deductions.push(`${overlapCount} activity overlap(s) or schedule conflicts detected.`);
    }

    // Cover image check
    let coverImageDeduction = 0;
    if (!trip.cover_image) {
      coverImageDeduction = 5;
      deductions.push('Missing cover image photo.');
    }

    // Calculate final score
    let healthScore = 100 - (100 - scheduleScore) - (100 - budgetScore) - (100 - activitiesScore) - (100 - travelTimeScore) - coverImageDeduction;
    healthScore = Math.max(0, Math.min(100, healthScore));

    let status = 'Excellent trip plan';
    if (healthScore < 50) status = 'Critical: Trip plan is incomplete or invalid';
    else if (healthScore < 70) status = 'Warning: Review trip plan spacing and budget';
    else if (healthScore < 85) status = 'Good trip plan, needs minor tweaks';

    const categoryScores = {
      budget: Math.max(0, budgetScore),
      schedule: Math.max(0, scheduleScore),
      travelTime: Math.max(0, travelTimeScore),
      activities: Math.max(0, activitiesScore)
    };

    return res.status(200).json({
      success: true,
      message: 'Trip health calculated successfully',
      data: {
        healthScore,
        status,
        categoryScores,
        deductions,
        conflicts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTripHealth
};
