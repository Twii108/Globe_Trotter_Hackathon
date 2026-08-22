const crypto = require('crypto');
const { calculateBudget } = require('../budget/budgetCalculator');
const { generateTimeline } = require('../timeline/timelineGenerator');

function generateShareId(tripId) {
    // Generate a unique 10-character alphanumeric share ID
    return crypto.createHash('sha256').update(tripId + Date.now().toString()).digest('hex').substring(0, 10);
}

function createPublicItinerary(trip) {
    if (!trip) return null;

    const timeline = generateTimeline(trip);
    const budget = calculateBudget(trip);

    // Creates a strictly read-only object safe for public consumption (hides private user info)
    return {
        isPublic: true,
        tripName: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        cities: trip.stops ? trip.stops.map(s => s.city) : [],
        activities: trip.stops ? trip.stops.flatMap(s => s.activities ? s.activities.map(a => a.name) : []) : [],
        timeline: timeline,
        budgetSummary: {
            totalEstimatedCost: budget.total,
            transportCost: budget.transport,
            stayCost: budget.stay,
            activitiesCost: budget.activities,
            mealsCost: budget.meals
        }
    };
}

module.exports = {
    generateShareId,
    createPublicItinerary
};
