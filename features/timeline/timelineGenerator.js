function generateTimeline(trip) {
    if (!trip || !trip.stops) return [];

    let timeline = [];
    let currentDate = new Date(trip.startDate || new Date());
    let currentDay = 1;

    trip.stops.forEach(stop => {
        const days = stop.durationDays || 1;
        
        // Distribute activities across the days
        const activitiesPerDay = Math.ceil((stop.activities ? stop.activities.length : 0) / days);
        let activityIndex = 0;

        for (let i = 0; i < days; i++) {
            let dayActivities = [];
            
            if (stop.activities) {
                dayActivities = stop.activities.slice(activityIndex, activityIndex + activitiesPerDay);
                activityIndex += activitiesPerDay;
            }

            let dayCost = 150; // base cost (stay + meals)
            dayActivities.forEach(a => dayCost += (a.estimatedCost || 0));

            timeline.push({
                day: `Day ${currentDay}`,
                date: new Date(currentDate).toISOString().split('T')[0],
                city: stop.city,
                activities: dayActivities.map(a => ({
                    name: a.name,
                    time: a.time || "TBD",
                    duration: a.duration,
                    cost: a.estimatedCost
                })),
                totalDayCost: dayCost
            });

            currentDate.setDate(currentDate.getDate() + 1);
            currentDay++;
        }
    });

    return timeline;
}

module.exports = { generateTimeline };
