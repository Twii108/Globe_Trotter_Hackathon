const cities = require('../data/cities.json');

function searchCities(query) {
    if (!query) return cities;
    const lowerQuery = query.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(lowerQuery) || c.country.toLowerCase().includes(lowerQuery));
}

function filterCitiesByCountry(country) {
    return cities.filter(c => c.country.toLowerCase() === country.toLowerCase());
}

function filterCitiesByRegion(region) {
    return cities.filter(c => c.region.toLowerCase() === region.toLowerCase());
}

function filterCitiesByCost(maxCost) {
    return cities.filter(c => c.costIndex <= maxCost);
}

function sortCitiesByPopularity() {
    return [...cities].sort((a, b) => b.popularity - a.popularity);
}

module.exports = {
    searchCities,
    filterCitiesByCountry,
    filterCitiesByRegion,
    filterCitiesByCost,
    sortCitiesByPopularity
};
