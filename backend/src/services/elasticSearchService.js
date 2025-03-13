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

      if (!indexExists) {
        await this.createIndex();
      } else {
        logger.info('Elasticsearch index already exists, skipping creation');
      }

      const duration = Date.now() - startTime;
      logger.service.end('ElasticSearchService', 'init', duration);
    } catch (error) {
      if (error.name === 'resource_already_exists_exception') {
        logger.info('Index already exists, continuing...');
        return;
      }
      logger.service.error('ElasticSearchService', 'init', error);
      throw error;
    }
  }

  async createIndex() {
    try {
      logger.service.start('ElasticSearchService', 'createIndex');

      await this.client.indices.create({
        index: this.index,
        body: {
          settings: {
            number_of_shards: 3,
            number_of_replicas: 2,
            analysis: {
              analyzer: {
                movie_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'stop', 'snowball']
                }
              }
            }
          },
          mappings: {
            properties: {
              title: { 
                type: 'text',
                analyzer: 'movie_analyzer',
                boost: 2.0
              },
              director: { 
                type: 'text',
                analyzer: 'movie_analyzer'
              },
              plot: { 
                type: 'text',
                analyzer: 'movie_analyzer'
              },
              year: { type: 'keyword', index:false },
              imdbID: { type: 'keyword', index:false }
            }
          }
        }
      });
      logger.info('Elasticsearch index created successfully');
    } catch (error) {
      if (error.name === 'resource_already_exists_exception') {
        logger.info('Index already exists, skipping creation');
        return;
      }
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