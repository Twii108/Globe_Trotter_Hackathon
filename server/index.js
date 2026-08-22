const express = require('express');
const cors = require('cors');
const citiesRoutes = require('./routes/cities');
const tripsRouter = require('./routes/trips');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/cities', citiesRoutes);
app.use('/api/trips', tripsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GlobeTrotter API server is running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
