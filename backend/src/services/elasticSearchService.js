const { Client } = require('@elastic/elasticsearch');
const config = require('../config/config');
const logger = require('../config/logger');

class ElasticSearchService {
  constructor() {
    this.client = new Client({ 
      nodes: config.elasticsearch.nodes,
      maxRetries: 3,
      requestTimeout: 30000
    });
    this.index = config.elasticsearch.index;
    this.init();
  }

  async init() {
    try {
      const startTime = Date.now();
      logger.service.start('ElasticSearchService', 'init');

      const indexExists = await this.client.indices.exists({
        index: this.index
      });

      if (!indexExists.body) {
        await this.createIndex();
      }

      const duration = Date.now() - startTime;
      logger.service.end('ElasticSearchService', 'init', duration);
    } catch (error) {
      logger.service.error('ElasticSearchService', 'init', error);
      throw error;
    }
  }

  async createIndex() {
    const startTime = Date.now();
    try {
      logger.service.start('ElasticSearchService', 'createIndex');

      await this.client.indices.create({
        index: this.index,
        body: {
          mappings: {
            properties: {
              title: { type: 'text' },
              director: { type: 'text' },
              plot: { type: 'text' },
              year: { type: 'keyword' },
              poster: { type: 'keyword' , "index": false },
              imdbID: { type: 'keyword', "index": false }
            }
          }
        }
      });

      const duration = Date.now() - startTime;
      logger.service.end('ElasticSearchService', 'createIndex', duration);
    } catch (error) {
      logger.service.error('ElasticSearchService', 'createIndex', error);
      throw error;
    }
  }

  async indexMovie(movie) {
    const startTime = Date.now();
    try {
      logger.service.start('ElasticSearchService', 'indexMovie', { movieId: movie.imdbID });

      await this.client.index({
        index: this.index,
        id: movie.imdbID,
        body: movie
      });

      const duration = Date.now() - startTime;
      logger.service.end('ElasticSearchService', 'indexMovie', duration, { movieId: movie.imdbID });
    } catch (error) {
      logger.service.error('ElasticSearchService', 'indexMovie', error, { movieId: movie.imdbID });
      throw error;
    }
  }

  async searchMovies(query) {
    const startTime = Date.now();
    try {
      logger.service.start('ElasticSearchService', 'searchMovies', { query });

      const response = await this.client.search({
        index: this.index,
        body: {
          query: {
            multi_match: {
              query: query,
              fields: ['title', 'director', 'plot']
            }
          }
        }
      });

      const results = response.body.hits.hits.map(hit => hit._source);
      const duration = Date.now() - startTime;
      
      logger.service.end('ElasticSearchService', 'searchMovies', duration, { 
        query,
        resultCount: results.length 
      });

      return results;
    } catch (error) {
      logger.service.error('ElasticSearchService', 'searchMovies', error, { query });
      throw error;
    }
  }
}

module.exports = new ElasticSearchService(); 