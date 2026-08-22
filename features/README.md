# GlobeTrotter Features - Hour 2

This module contains the travel data, budget calculators, timeline generators, and trip summaries for GlobeTrotter, entirely isolated from the frontend and backend to avoid merge conflicts.

## Hour 2: Utilities Added

### 1. Budget Calculator (`budget/budgetCalculator.js`)
Calculates comprehensive financial data for a trip.

**Key Function:** `calculateBudget(trip, userBudget)`
**Returns:**
```json
{
  "transport": 400,
  "stay": 500,
  "activities": 120,
  "meals": 250,
  "total": 1270,
  "averagePerDay": 254,
  "overBudget": false,
  "budgetRemaining": 230
}
```

**Key Function:** `getDailyBudget(trip, dailyLimit)`
**Returns:**
```json
[
  { "date": "2026-09-15", "total": 174, "overBudget": false },
  { "date": "2026-09-16", "total": 174, "overBudget": false }
]
```

### 2. Timeline Generator (`timeline/timelineGenerator.js`)
Generates a structured, chronological timeline spanning multiple cities.

**Key Function:** `generateTimeline(trip)`
**Returns:**
```json
[
  {
    "day": "Day 1",
    "date": "2026-09-15",
    "city": "Paris",
    "activities": [
      { "name": "Eiffel Tower Tour", "time": "TBD", "duration": 2.5, "cost": 30 }
    ],
    "totalDayCost": 180
  }
]
```

### 3. Trip Summary (`summary/tripSummary.js`)
Generates high-level statistics for the dashboard or itinerary view.

**Key Function:** `generateTripSummary(trip)`
**Returns:**
```json
{
  "totalTripDays": 7,
  "numberOfCities": 2,
  "numberOfActivities": 4,
  "totalEstimatedCost": 1500,
  "averageDailyCost": 214.28,
  "mostExpensiveDay": { "day": "Day 2", "date": "2026-09-16", "cost": 350 },
  "mostExpensiveCity": { "city": "Paris", "cost": 900 }
}
```

### ⚠️ Sample Trip Object (Input Format required by these modules)
Your `trip` object passed from the frontend/backend should look like this:
```json
{
  "id": "t1",
  "name": "Euro Trip",
  "startDate": "2026-09-15",
  "stops": [
    {
      "city": "Paris",
      "durationDays": 3,
      "activities": [
        { "name": "Eiffel Tower Tour", "estimatedCost": 30, "duration": 2 }
      ]
    }
  ]
}
```

---

## Hour 1: Data & Recommendations
*   `data/cities.json`, `data/activities.json`
*   `search/citySearch.js`, `search/activitySearch.js`
*   `recommendations/recommendations.js`
