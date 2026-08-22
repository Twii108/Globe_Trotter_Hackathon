function calculateTransportCost(trip) {
    if (!trip.stops || trip.stops.length === 0) return 0;
    // Assuming a base flight cost + intercity travel
    return 300 + (trip.stops.length - 1) * 100;
}

function calculateStayCost(trip) {
    if (!trip.stops) return 0;
    let totalStay = 0;
    trip.stops.forEach(stop => {
        totalStay += (stop.durationDays || 1) * 100; // Mock: $100/night
    });
    return totalStay;
}

function calculateActivityCost(trip) {
    if (!trip.stops) return 0;
    let totalActivity = 0;
    trip.stops.forEach(stop => {
        if (stop.activities) {
            stop.activities.forEach(activity => {
                totalActivity += (activity.estimatedCost || 0);
            });
        }
    });
    return totalActivity;
}

function calculateMealCost(trip) {
    if (!trip.stops) return 0;
    let totalMeals = 0;
    trip.stops.forEach(stop => {
        totalMeals += (stop.durationDays || 1) * 50; // Mock: $50/day
    });
    return totalMeals;
}

function calculateTotalCost(trip) {
    return calculateTransportCost(trip) + 
           calculateStayCost(trip) + 
           calculateActivityCost(trip) + 
           calculateMealCost(trip);
}

function calculateTotalDays(trip) {
    if (!trip.stops) return 1;
    return trip.stops.reduce((acc, stop) => acc + (stop.durationDays || 1), 0);
}

function calculateAverageDailyCost(trip) {
    const total = calculateTotalCost(trip);
    const days = calculateTotalDays(trip);
    return days > 0 ? Number((total / days).toFixed(2)) : 0;
}

function calculateBudget(trip, userBudget = null) {
    const transport = calculateTransportCost(trip);
    const stay = calculateStayCost(trip);
    const activities = calculateActivityCost(trip);
    const meals = calculateMealCost(trip);
    const total = transport + stay + activities + meals;
    const averagePerDay = calculateAverageDailyCost(trip);
    
    let overBudget = false;
    let budgetRemaining = null;

    if (userBudget !== null) {
        overBudget = total > userBudget;
        budgetRemaining = userBudget - total;
    }

    return {
        transport,
        stay,
        activities,
        meals,
        total,
        averagePerDay,
        overBudget,
        budgetRemaining
    };
}

function getDailyBudget(trip, dailyLimit = null) {
    if (!trip.stops) return [];
    let dailyBudgets = [];
    let currentDate = new Date(trip.startDate || new Date());

    trip.stops.forEach(stop => {
        const days = stop.durationDays || 1;
        const dailyStay = 100; 
        const dailyMeals = 50; 
        
        for (let i = 0; i < days; i++) {
            let dailyActivityCost = 0;
            if (stop.activities && stop.activities.length > 0) {
                const totalAct = stop.activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);
                dailyActivityCost = totalAct / days; // Distribute evenly
            }
            
            const total = dailyStay + dailyMeals + dailyActivityCost;
            
            dailyBudgets.push({
                date: new Date(currentDate).toISOString().split('T')[0],
                total: Number(total.toFixed(2)),
                overBudget: dailyLimit !== null ? total > dailyLimit : false
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    return dailyBudgets;
}

module.exports = {
    calculateTransportCost,
    calculateStayCost,
    calculateActivityCost,
    calculateMealCost,
    calculateTotalCost,
    calculateAverageDailyCost,
    calculateBudget,
    getDailyBudget
};
