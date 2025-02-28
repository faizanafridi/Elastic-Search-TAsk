const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./config/logger');
const movieRoutes = require('./routes/movieRoutes');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  logger.api.request(req);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.api.response(req, res, duration);
  });
  
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/movies', movieRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { error: err });
  res.status(500).json({ error: 'Something went wrong!' });
});

// Only start the server if this file is run directly (not required as a module)
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(config.mongodb.uri)
    .then(() => {
      logger.info('Connected to MongoDB');
      
      // Start server
      app.listen(config.app.port, () => {
        logger.info(`Server running on port ${config.app.port}`);
      });
    })
    .catch((error) => {
      logger.error('MongoDB connection error:', error);
      process.exit(1);
    });
}

module.exports = app; 