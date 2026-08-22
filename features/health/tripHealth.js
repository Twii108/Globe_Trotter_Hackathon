const { validateTrip } = require('../validation/tripValidator');
const { calculateBudget } = require('../budget/budgetCalculator');

function calculateTripHealth(trip, userBudget) {
    let score = 100;
    let explanations = [];

    // 1. Validation & Structure
    const validation = validateTrip(trip);
    if (!validation.isValid) {
        score -= 30;
        explanations.push("⚠ Invalid dates or structure detected.");
    } else {
        explanations.push("✓ Dates valid");
    }

    // 2. Budget Health
    if (userBudget) {
        const budget = calculateBudget(trip);
        if (budget.total > userBudget) {
            score -= 20;
            explanations.push("⚠ Significantly over budget");
        } else {
            explanations.push("✓ Budget optimal");
        }
    } else {
        explanations.push("○ Budget not set");
    }

    // 3. Activity Completeness
    let hasActivities = false;
    let missingActivities = false;
    if (trip.stops && trip.stops.length > 0) {
        trip.stops.forEach(stop => {
            if (stop.activities && stop.activities.length > 0) hasActivities = true;
            else missingActivities = true;
        });
    } else {
        missingActivities = true;
    }
    
    if (!hasActivities) {
        score -= 15;
        explanations.push("⚠ No activities planned");
    } else if (missingActivities) {
        score -= 5;
        explanations.push("○ Some cities missing activities");
    } else {
        explanations.push("✓ Activities scheduled");
    }

    // 4. Pacing / Travel-time gaps
    const totalDays = trip.stops ? trip.stops.reduce((acc, s) => acc + (s.durationDays || 0), 0) : 0;
    const cityCount = trip.stops ? trip.stops.length : 0;
    
    if (cityCount > 0 && totalDays / cityCount < 1.5) {
        score -= 10;
        explanations.push("⚠ Rushed schedule (too many cities, too few days)");
    } else if (cityCount > 0) {
        explanations.push("✓ Pacing optimal");
    }

    // Formulate final status
    let status = "Excellent trip plan";
    if (score < 85) status = "Good trip plan, needs minor tweaks";
    if (score < 70) status = "Warning: Review trip plan spacing and budget";
    if (score < 50) status = "Critical: Trip plan is incomplete or invalid";

    return {
        score: Math.max(0, score),
        status,
        explanations
    };
}

module.exports = { calculateTripHealth };
