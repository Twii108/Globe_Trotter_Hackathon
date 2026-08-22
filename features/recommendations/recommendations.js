const { sortCitiesByPopularity } = require('../search/citySearch');
const activities = require('../data/activities.json');

function getRecommendedCities() {
    // Return top 5 most popular cities
    return sortCitiesByPopularity().slice(0, 5);
}

function getRecommendedActivities(cityId) {
    // Return activities for a specific city, sorted by category for variety
    const cityActivities = activities.filter(a => a.cityId === cityId);
    return cityActivities.sort((a, b) => a.category.localeCompare(b.category));
}

module.exports = {
    getRecommendedCities,
    getRecommendedActivities
};
