// features/test_flow.js
const { validateTrip } = require('./validation/tripValidator');
const { generateTimeline } = require('./timeline/timelineGenerator');
const { calculateBudget } = require('./budget/budgetCalculator');
const { generateTripSummary } = require('./summary/tripSummary');
const { generateShareId, createPublicItinerary } = require('./sharing/shareGenerator');

// 1. Create Trip (Mocking frontend state)
const myTrip = {
    id: "t100",
    name: "Honeymoon in Paris",
    startDate: "2026-10-01",
    endDate: "2026-10-05",
    stops: []
};

// 2. Add City & Activities (Mocking adding to state)
myTrip.stops.push({
    cityId: "c1",
    city: "Paris",
    durationDays: 4,
    activities: [
        { cityId: "c1", name: "Eiffel Tower Tour", estimatedCost: 30, duration: 2.5 },
        { cityId: "c1", name: "Louvre Museum", estimatedCost: 20, duration: 4 }
    ]
});

// 3. Validation
console.log("--- Validation ---");
const validation = validateTrip(myTrip);
console.log(validation);

if (validation.isValid) {
    // 4. Generate Timeline
    console.log("\n--- Timeline ---");
    const timeline = generateTimeline(myTrip);
    console.log(`Generated ${timeline.length} days of timeline.`);

    // 5. Calculate Budget
    console.log("\n--- Budget ---");
    const budget = calculateBudget(myTrip);
    console.log(`Total Cost: $${budget.total}`);

    // 6. Generate Summary
    console.log("\n--- Summary ---");
    const summary = generateTripSummary(myTrip);
    console.log(summary);

    // 7. Generate Share ID & Public Itinerary
    console.log("\n--- Sharing ---");
    const shareId = generateShareId(myTrip.id);
    const publicItin = createPublicItinerary(myTrip);
    console.log(`Share ID: ${shareId}`);
    console.log(`Public Itinerary Name: ${publicItin.tripName}`);
    console.log("\n✅ All systems GO! MVP Flow tested successfully.");
} else {
    console.log("❌ Validation failed!", validation.errors);
}
