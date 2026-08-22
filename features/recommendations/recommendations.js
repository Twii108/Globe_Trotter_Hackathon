const { sortCitiesByPopularity } = require('../search/citySearch');
const activities = require('../data/activities.json');

function getRecommendedCities(userPreferences = {}) {
    let cities = sortCitiesByPopularity();

    if (userPreferences.maxCost) {
        cities = cities.filter(c => c.costIndex <= userPreferences.maxCost);
    }
    
    if (userPreferences.region) {
        cities = cities.filter(c => c.region.toLowerCase() === userPreferences.region.toLowerCase());
    }

    // Return top 5 most popular cities matching preferences
    return cities.slice(0, 5);
}

function getRecommendedActivities(cityId, preferences = {}) {
    let cityActivities = activities.filter(a => a.cityId === cityId);

    if (preferences.category) {
        cityActivities = cityActivities.filter(a => a.category.toLowerCase() === preferences.category.toLowerCase());
    }

    if (preferences.maxCost !== undefined) {
        cityActivities = cityActivities.filter(a => (a.estimatedCost || 0) <= preferences.maxCost);
    }

    // Sort by category to ensure varied results
    return cityActivities.sort((a, b) => a.category.localeCompare(b.category));
}

module.exports = {
    getRecommendedCities,
    getRecommendedActivities
};
