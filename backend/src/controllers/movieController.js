const movieService = require('../services/movieService');
const redisService = require('../services/redisService');
const logger = require('../config/logger');

class MovieController {
  async fetchMovies(req, res) {
    const startTime = Date.now();
    try {
      logger.service.start('MovieController', 'fetchMovies');

      await movieService.fetchAndStoreSpaceMovies();
      // Clear Redis cache when new movies are fetched
      await redisService.clearCache();

      const duration = Date.now() - startTime;
      logger.service.end('MovieController', 'fetchMovies', duration);

      res.json({ 
        message: 'Movies fetched successfully',
        processingTime: `${duration}ms`
      });
    } catch (error) {
      logger.service.error('MovieController', 'fetchMovies', error);
      res.status(500).json({ 
        error: 'Failed to fetch and store movies',
        message: error.message 
      });
    }
  }

  async searchMovies(req, res) {
    const startTime = Date.now();
    try {
      const { query } = req.query;
      logger.service.start('MovieController', 'searchMovies', { query });

      let results;
      let source = 'cache';

      try {
        results = await redisService.get(query);
      } catch (cacheError) {
        logger.error('Cache error', { error: cacheError.message });
        results = null;
      }

      if (!results) {
        // If not in cache or cache error, search elasticsearch
        results = await movieService.searchMovies(query);
        source = 'elasticsearch';

        // Try to cache the results
        try {
          await redisService.set(query, results);
        } catch (cacheError) {
          logger.error('Cache set error', { error: cacheError.message });
          // Continue without caching
        }
      }

      const duration = Date.now() - startTime;
      logger.service.end('MovieController', 'searchMovies', duration, {
        query,
        resultCount: results.length,
        source
      });

      res.json({
        results,
        source,
        count: results.length,
        processingTime: `${duration}ms`
      });
    } catch (error) {
      logger.service.error('MovieController', 'searchMovies', error);
      res.status(500).json({ 
        error: 'Failed to search movies',
        message: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new MovieController(); 