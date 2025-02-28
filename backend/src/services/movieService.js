const Movie = require('../models/Movie');
const omdbService = require('./omdbService');
const elasticSearchService = require('./elasticSearchService');
const logger = require('../config/logger');

class MovieService {
  async fetchAndStoreSpaceMovies() {
    const startTime = Date.now();
    try {
      logger.service.start('MovieService', 'fetchAndStoreSpaceMovies');

      const movies = await omdbService.searchMovies('space', '2020');
      logger.debug('Found space movies to process', { count: movies.length });
      
      let successCount = 0;
      let errorCount = 0;

      for (const movie of movies) {
        try {
          const details = await omdbService.getMovieDetails(movie.imdbID);
          if (details) {
            const movieData = {
              title: details.Title,
              year: details.Year,
              director: details.Director,
              plot: details.Plot,
              poster: details.Poster,
              imdbID: details.imdbID
            };

            // Store in MongoDB
            const savedMovie = await Movie.findOneAndUpdate(
              { imdbID: movieData.imdbID },
              movieData,
              { upsert: true, new: true }
            );

            // Index in Elasticsearch
            await elasticSearchService.indexMovie(movieData);
            
            successCount++;
            logger.debug('Successfully processed movie', { 
              movieId: movie.imdbID,
              title: details.Title 
            });
          }
        } catch (error) {
          errorCount++;
          logger.error('Error processing individual movie', {
            movieId: movie.imdbID,
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;
      logger.service.end('MovieService', 'fetchAndStoreSpaceMovies', duration, {
        totalProcessed: movies.length,
        successCount,
        errorCount
      });

    } catch (error) {
      logger.service.error('MovieService', 'fetchAndStoreSpaceMovies', error);
      throw error;
    }
  }

  async searchMovies(query) {
    const startTime = Date.now();
    try {
      logger.service.start('MovieService', 'searchMovies', { query });

      const results = await elasticSearchService.searchMovies(query);

      const duration = Date.now() - startTime;
      logger.service.end('MovieService', 'searchMovies', duration, {
        query,
        resultCount: results.length
      });

      return results;
    } catch (error) {
      logger.service.error('MovieService', 'searchMovies', error, { query });
      throw error;
    }
  }
}

module.exports = new MovieService(); 