const activities = require('../data/activities.json');

function searchActivities(query) {
    if (!query) return activities;
    const lowerQuery = query.toLowerCase();
    return activities.filter(a => a.name.toLowerCase().includes(lowerQuery) || a.description.toLowerCase().includes(lowerQuery));
}

function filterActivitiesByCategory(category) {
    return activities.filter(a => a.category.toLowerCase() === category.toLowerCase());
}

function filterActivitiesByCost(maxCost) {
    return activities.filter(a => a.estimatedCost <= maxCost);
}

function filterActivitiesByDuration(maxDuration) {
    return activities.filter(a => a.duration <= maxDuration);
}

module.exports = {
    searchActivities,
    filterActivitiesByCategory,
    filterActivitiesByCost,
    filterActivitiesByDuration
};
