const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Initialize DB connection & schema
require('./database');

const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const stopRoutes = require('./routes/stops');
const activityRoutes = require('./routes/activities');
const cityRoutes = require('./routes/cities');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GlobeTrotter API is running'
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/cities', cityRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
    data: null
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`GlobeTrotter API server running on port ${PORT}`);
  });
}

module.exports = app;
