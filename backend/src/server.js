require('dotenv').config();
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const mongoose = require('mongoose');

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