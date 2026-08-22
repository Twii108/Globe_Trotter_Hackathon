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

    const timeline = generateTimeline(trip);
    let mostExpensiveDay = null;
    let maxDayCost = 0;
    
    timeline.forEach(day => {
        if (day.totalDayCost > maxDayCost) {
            maxDayCost = day.totalDayCost;
            mostExpensiveDay = day;
        }
    });

    let cityCosts = {};
    trip.stops.forEach(stop => {
        const days = stop.durationDays || 1;
        let actCost = 0;
        if (stop.activities) {
            actCost = stop.activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);
        }
        cityCosts[stop.city] = (cityCosts[stop.city] || 0) + (days * 150) + actCost;
    });

    let mostExpensiveCity = null;
    let maxCityCost = 0;
    for (const [city, cost] of Object.entries(cityCosts)) {
        if (cost > maxCityCost) {
            maxCityCost = cost;
            mostExpensiveCity = city;
        }
    }

    return {
        totalTripDays,
        numberOfCities,
        numberOfActivities,
        totalEstimatedCost,
        averageDailyCost,
        mostExpensiveDay: mostExpensiveDay ? { day: mostExpensiveDay.day, date: mostExpensiveDay.date, cost: maxDayCost } : null,
        mostExpensiveCity: mostExpensiveCity ? { city: mostExpensiveCity, cost: maxCityCost } : null
    };
}

module.exports = { generateTripSummary };
