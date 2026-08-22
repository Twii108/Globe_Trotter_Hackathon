function validateTrip(trip) {
    const errors = [];

    // 1. Dates Validation
    if (!trip.startDate || !trip.endDate) {
        errors.push("Trip must contain valid startDate and endDate.");
    } else {
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        if (end < start) {
            errors.push("End date cannot be before start date.");
        }
    }

    // 2. Stops and Activities Validation
    if (trip.stops) {
        trip.stops.forEach((stop, index) => {
            if (!stop.durationDays || stop.durationDays <= 0) {
                errors.push(`Stop ${index + 1} (${stop.city}) must have a valid duration > 0.`);
            }
            if (stop.activities) {
                stop.activities.forEach(act => {
                    // Check city mismatch
                    if (act.cityId && stop.cityId && act.cityId !== stop.cityId) {
                        errors.push(`Activity '${act.name}' does not belong to the selected city '${stop.city}'.`);
                    }
                    // Check negative cost
                    if (act.estimatedCost !== undefined && act.estimatedCost < 0) {
                        errors.push(`Costs cannot be negative. Found negative cost in '${act.name}'.`);
                    }
                });
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = { validateTrip };
