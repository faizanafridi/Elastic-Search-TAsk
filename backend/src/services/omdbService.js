const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');

class OmdbService {
  constructor() {
    logger.service.start('OmdbService', 'constructor');
    this.apiKey = config.omdb.apiKey;
    this.baseUrl = config.omdb.baseUrl;
  }

  async searchMoviesPage(query, year, page = 1) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          s: query,
          y: year,
          page: page
        }
      });

      // Handle "Movie not found" response
      if (response.data.Response === 'False') {
        return {
          movies: [],
          totalResults: 0
        };
      }

      return {
        movies: response.data.Search || [],
        totalResults: parseInt(response.data.totalResults) || 0
      };
    } catch (error) {
      logger.service.error('OmdbService', 'searchMoviesPage', error, { query, year, page });
      throw error;
    }
  }

  async searchMovies(query, year,resultsPerPage=10) {
    try {
      const firstPage = await this.searchMoviesPage(query, year, 1);
      
      if (!firstPage.movies.length) {
        return [];
      }

      const totalResults = firstPage.totalResults;
      const totalPages = Math.ceil(totalResults / resultsPerPage);

      if (totalPages <= 1) {
        return firstPage.movies;
      }

      // Fetch remaining pages
      const otherPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          this.searchMoviesPage(query, year, i + 2)
        )
      );

      // Combine all results
      const allMovies = [
        ...firstPage.movies,
        ...otherPages.flatMap(page => page.movies)
      ];

      return allMovies;
    } catch (error) {
      logger.service.error('OmdbService', 'searchMovies', error, { query, year });
      throw error;
    }
  }

  async getMovieDetails(imdbId) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          i: imdbId,
          plot: 'full'
        }
      });

      if (response.data.Response === 'False') {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.service.error('OmdbService', 'getMovieDetails', error, { imdbId });
      throw error;
    }
  }
}

module.exports = new OmdbService();