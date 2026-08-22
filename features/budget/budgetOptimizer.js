const activitiesData = require('../data/activities.json');
const { calculateBudget } = require('./budgetCalculator');

function optimizeBudget(trip, userBudget) {
    if (!trip || !userBudget) return null;
    
    const currentBudget = calculateBudget(trip);
    
    if (currentBudget.total <= userBudget) {
        return { optimized: false, message: "Trip is already within budget." };
    }

    let suggestions = [];
    let potentialSavings = 0;

    // Suggestion 1: Find cheaper alternative activities
    if (trip.stops) {
        trip.stops.forEach(stop => {
            if (stop.activities) {
                stop.activities.forEach(act => {
                    // Find alternatives in the same city and category that cost less
                    const alternatives = activitiesData.filter(a => 
                        a.cityId === stop.cityId && 
                        a.category === (act.category || "Sightseeing") &&
                        (a.estimatedCost || 0) < (act.estimatedCost || 0)
                    );
                    
                    if (alternatives.length > 0) {
                        const bestAlt = alternatives.sort((a, b) => a.estimatedCost - b.estimatedCost)[0];
                        const savings = (act.estimatedCost || 0) - bestAlt.estimatedCost;
                        
                        suggestions.push({
                            type: "Activity",
                            description: `Replace '${act.name}' with '${bestAlt.name}'`,
                            currentCost: act.estimatedCost,
                            newCost: bestAlt.estimatedCost,
                            saving: savings
                        });
                        potentialSavings += savings;
                    }
                });
            }
        });
    }

    // Suggestion 2: Reduce accommodation cost
    const staySavings = currentBudget.stay * 0.20; // Suggest 20% reduction via hostels/budget hotels
    if (staySavings > 0) {
        suggestions.push({
            type: "Accommodation",
            description: "Choose budget accommodation or hostels instead of standard hotels",
            currentCost: currentBudget.stay,
            newCost: currentBudget.stay - staySavings,
            saving: staySavings
        });
        potentialSavings += staySavings;
    }

    return {
        optimized: true,
        currentTotal: currentBudget.total,
        targetBudget: userBudget,
        potentialTotalSaving: potentialSavings,
        suggestions: suggestions
    };
}

module.exports = { optimizeBudget };
