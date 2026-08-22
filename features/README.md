# GlobeTrotter Features - Hour 1

This module contains the travel data and utility functions for GlobeTrotter, entirely isolated from the frontend and backend to avoid merge conflicts.

## Data Structures

### City Data (`data/cities.json`)
Contains 15 diverse global destinations. Each object includes:
- `id`: Unique identifier (e.g., "c1")
- `name`: City name
- `country`: Country name
- `region`: Geographic region
- `costIndex`: Scale of 1-10 for budget estimates
- `popularity`: Scale of 1-100
- `description`: Brief summary

### Activity Data (`data/activities.json`)
Contains activities mapped to cities. Categories include Sightseeing, Food, Adventure, Culture, Shopping, Nature.
- `id`: Unique identifier
- `cityId`: Foreign key to `cities.json`
- `name`: Activity title
- `category`: Activity type
- `description`: Details
- `duration`: Estimated hours
- `estimatedCost`: Approximate cost in USD

## Functions

### `search/citySearch.js`
- `searchCities(query)`: Search by name or country.
- `filterCitiesByCountry(country)`: Exact match country.
- `filterCitiesByRegion(region)`: Exact match region.
- `filterCitiesByCost(maxCost)`: Filter by maximum cost index.
- `sortCitiesByPopularity()`: Returns list sorted highest to lowest popularity.

### `search/activitySearch.js`
- `searchActivities(query)`: Search by name or description.
- `filterActivitiesByCategory(category)`: Exact match category.
- `filterActivitiesByCost(maxCost)`: Filter by maximum dollar cost.
- `filterActivitiesByDuration(maxDuration)`: Filter by maximum hours.

### `recommendations/recommendations.js`
- `getRecommendedCities()`: Returns top 5 global cities based on popularity.
- `getRecommendedActivities(cityId)`: Returns a curated list of activities for a specific city.
