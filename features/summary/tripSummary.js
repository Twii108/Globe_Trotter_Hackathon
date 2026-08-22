const { calculateTotalCost, calculateAverageDailyCost } = require('../budget/budgetCalculator');
const { generateTimeline } = require('../timeline/timelineGenerator');

function generateTripSummary(trip) {
    if (!trip || !trip.stops) return null;

    const totalTripDays = trip.stops.reduce((acc, stop) => acc + (stop.durationDays || 1), 0);
    const numberOfCities = trip.stops.length;
    
    let numberOfActivities = 0;
    trip.stops.forEach(stop => {
        if (stop.activities) numberOfActivities += stop.activities.length;
    });

    const totalEstimatedCost = calculateTotalCost(trip);
    const averageDailyCost = calculateAverageDailyCost(trip);

    // Final required format for Hackathon MVP
    return {
        tripName: trip.name || "Unnamed Trip",
        duration: totalTripDays,
        cityCount: numberOfCities,
        activityCount: numberOfActivities,
        estimatedCost: totalEstimatedCost,
        averageDailyCost: averageDailyCost
    };
}

module.exports = { generateTripSummary };
