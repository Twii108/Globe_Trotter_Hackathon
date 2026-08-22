const { dbGet, dbAll } = require('../database');

// GET /api/trips/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get user profile details
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        data: null
      });
    }

    // 2. Fetch user's real trip budgets to calculate target budget
    const trips = await dbAll('SELECT budget FROM trips WHERE user_id = ?', [userId]);
    let userBudget = 2500;
    if (trips && trips.length > 0) {
      const totalBudget = trips.reduce((sum, t) => sum + (Number(t.budget) || 0), 0);
      const tripsWithBudget = trips.filter(t => Number(t.budget) > 0).length;
      if (tripsWithBudget > 0) {
        userBudget = totalBudget / tripsWithBudget;
      }
    }

    // 3. Get history of stops planned by the user
    const stops = await dbAll(
      `SELECT DISTINCT city_id FROM stops 
       WHERE trip_id IN (SELECT id FROM trips WHERE user_id = ?)`,
      [userId]
    );
    const visitedCityIds = stops.map(s => String(s.city_id));

    // 4. Fetch all cities in the catalog
    const cities = await dbAll('SELECT * FROM cities ORDER BY popularity DESC, name ASC');

    const recommendedCities = [];

    for (const city of cities) {
      let score = 75; // base score
      const whyRecommended = [];

      // Budget Match
      const cityCost = (city.cost_index || 5) * (userBudget / 10);
      if (cityCost <= userBudget) {
        score += 10;
        whyRecommended.push('Fits comfortably within your target budget');
      }

      // Interest / Region Match
      const style = user.travel_style || 'Balanced Explorer';
      const desc = (city.description || '').toLowerCase();
      const region = (city.region || '').toLowerCase();

      let matchedStyle = false;
      if (style.includes('Culture') && (desc.includes('temple') || desc.includes('art') || region.includes('europe') || desc.includes('museum') || desc.includes('history'))) {
        matchedStyle = true;
      } else if ((style.includes('Adventure') || style.includes('Nature')) && (desc.includes('mountain') || desc.includes('beach') || desc.includes('citadel') || desc.includes('forest') || desc.includes('hike') || desc.includes('nature') || desc.includes('volcanic'))) {
        matchedStyle = true;
      } else if (style.includes('Shopping') && (desc.includes('mall') || desc.includes('shopping') || desc.includes('textiles') || desc.includes('market'))) {
        matchedStyle = true;
      } else if (style.includes('Food') && (desc.includes('food') || desc.includes('dining') || desc.includes('street food') || desc.includes('cuisine') || desc.includes('cafe'))) {
        matchedStyle = true;
      }

      if (matchedStyle) {
        score += 10;
        whyRecommended.push(`Matches your ${style} travel style`);
      } else {
        whyRecommended.push('Popular cultural & scenic highlights');
      }

      // History Match
      if (visitedCityIds.includes(String(city.id))) {
        score += 5;
        whyRecommended.push('Pairs with your travel history');
      }

      // Popularity
      if ((city.popularity || 80) >= 90) {
        score += 5;
        whyRecommended.push('Top-rated global destination (90%+ rating)');
      }

      // Default duration suitability
      whyRecommended.push('Suitable for a 5 to 7-day vacation itinerary');

      const finalScore = Math.min(99, Math.max(65, score));

      recommendedCities.push({
        ...city,
        matchScore: finalScore,
        whyRecommended
      });
    }

    // Sort by match score descending
    recommendedCities.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      message: 'City recommendations generated successfully',
      data: recommendedCities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations
};
