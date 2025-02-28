const { mock } = require('jest-mock-extended');
const Movie = require('../src/models/Movie');
const OmdbService = require('../src/services/omdbService');
const ElasticSearchService = require('../src/services/elasticSearchService');
const RedisService = require('../src/services/redisService');
const MovieService = require('../src/services/movieService');
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const config = require('../src/config/config');

// Mock the dependencies
jest.mock('../src/services/omdbService');
jest.mock('../src/services/elasticSearchService');
jest.mock('../src/services/redisService');
jest.mock('../src/models/Movie');

let server;

beforeAll(async () => {
  await mongoose.connect(config.mongodbUri);
  server = app.listen(0);
});

afterAll(async () => {
  await Promise.all([
    mongoose.connection.close(),
    new Promise(resolve => server.close(resolve)),
    RedisService.client.quit()
  ]);
});

beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset Redis mock implementations
  RedisService.get.mockImplementation(() => Promise.resolve(null));
  RedisService.set.mockImplementation(() => Promise.resolve('OK'));
  RedisService.clearCache.mockImplementation(() => Promise.resolve());
  
  // Reset ElasticSearch mock implementations
  ElasticSearchService.searchMovies.mockImplementation(() => Promise.resolve([]));
  ElasticSearchService.indexMovie.mockImplementation(() => Promise.resolve());
  ElasticSearchService.init.mockImplementation(() => Promise.resolve());
  
  // Reset Movie model mock
  Movie.findOneAndUpdate.mockImplementation(() => Promise.resolve({}));
  
  // Reset OMDB service mock
  OmdbService.searchMovies.mockImplementation(() => Promise.resolve([]));
  OmdbService.getMovieDetails.mockImplementation(() => Promise.resolve({}));
});

describe('MovieController', () => {
  describe('searchMovies', () => {
    it('should return cached results if available', async () => {
      const mockCachedResults = [
        { title: 'Cached Movie', director: 'Director' }
      ];

      RedisService.get.mockResolvedValue(mockCachedResults);

      const response = await request(server)
        .get('/api/movies/search')
        .query({ query: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.source).toBe('cache');
      expect(response.body.results).toEqual(mockCachedResults);
      expect(ElasticSearchService.searchMovies).not.toHaveBeenCalled();
    });

    it('should search elasticsearch and cache results if not in cache', async () => {
      const mockSearchResults = [
        { title: 'Test Movie', director: 'Director' }
      ];

      RedisService.get.mockResolvedValueOnce(null);
      ElasticSearchService.searchMovies.mockResolvedValueOnce(mockSearchResults);

      const response = await request(server)
        .get('/api/movies/search')
        .query({ query: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.source).toBe('elasticsearch');
      expect(response.body.results).toEqual(mockSearchResults);
      expect(RedisService.set).toHaveBeenCalledWith(expect.any(String), mockSearchResults);
    });

    it('should handle cache service errors gracefully', async () => {
      const mockSearchResults = [
        { title: 'Test Movie', director: 'Director' }
      ];

      RedisService.get.mockRejectedValueOnce(new Error('Cache error'));
      ElasticSearchService.searchMovies.mockResolvedValueOnce(mockSearchResults);

      const response = await request(server)
        .get('/api/movies/search')
        .query({ query: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.source).toBe('elasticsearch');
      expect(response.body.results).toEqual(mockSearchResults);
    }, 10000);

    it('should handle both cache and elasticsearch errors', async () => {
      RedisService.get.mockRejectedValue(new Error('Cache error'));
      ElasticSearchService.searchMovies.mockRejectedValue(new Error('Search error'));

      const response = await request(server)
        .get('/api/movies/search')
        .query({ query: 'test' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to search movies');
    });
  });

  describe('fetchMovies', () => {
    it('should clear cache after fetching movies', async () => {
      OmdbService.searchMovies.mockResolvedValue([]);
      RedisService.clearCache.mockResolvedValue();

      const response = await request(server)
        .post('/api/movies/fetch');

      expect(response.status).toBe(200);
      expect(RedisService.clearCache).toHaveBeenCalled();
    });

    it('should handle errors during fetch', async () => {
      OmdbService.searchMovies.mockRejectedValue(new Error('API Error'));
      RedisService.clearCache.mockResolvedValue();

      const response = await request(server)
        .post('/api/movies/fetch');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('MovieService', () => {
  describe('fetchAndStoreSpaceMovies', () => {
    it('should fetch and store space movies successfully', async () => {
      // Mock data
      const mockMovies = [
        { imdbID: 'tt1234567', Title: 'Space Movie' }
      ];

      const mockMovieDetails = {
        Title: 'Space Movie',
        Year: '2020',
        Director: 'John Doe',
        Plot: 'A movie about space',
        Poster: 'poster.jpg',
        imdbID: 'tt1234567'
      };

      // Setup mocks
      OmdbService.searchMovies.mockResolvedValue(mockMovies);
      OmdbService.getMovieDetails.mockResolvedValue(mockMovieDetails);
      Movie.findOneAndUpdate.mockResolvedValue(mockMovieDetails);
      ElasticSearchService.indexMovie.mockResolvedValue();

      // Execute
      await MovieService.fetchAndStoreSpaceMovies();

      // Assert
      expect(OmdbService.searchMovies).toHaveBeenCalledWith('space', '2020');
      expect(OmdbService.getMovieDetails).toHaveBeenCalledWith('tt1234567');
      expect(Movie.findOneAndUpdate).toHaveBeenCalled();
      expect(ElasticSearchService.indexMovie).toHaveBeenCalled();
    });

    it('should handle errors when fetching movies', async () => {
      // Setup mock to throw error
      const error = new Error('API Error');
      OmdbService.searchMovies.mockRejectedValue(error);

      // Execute and assert
      await expect(MovieService.fetchAndStoreSpaceMovies()).rejects.toThrow('API Error');
    });
  });

  describe('searchMovies', () => {
    it('should search movies successfully', async () => {
      // Mock data
      const mockSearchResults = [
        {
          title: 'Space Movie',
          director: 'John Doe',
          plot: 'A movie about space'
        }
      ];

      // Setup mock
      ElasticSearchService.searchMovies.mockResolvedValue(mockSearchResults);

      // Execute
      const result = await MovieService.searchMovies('space');

      // Assert
      expect(result).toEqual(mockSearchResults);
      expect(ElasticSearchService.searchMovies).toHaveBeenCalledWith('space');
    });

    it('should handle search errors', async () => {
      // Setup mock to throw error
      const error = new Error('Search Error');
      RedisService.get.mockResolvedValue(null);
      ElasticSearchService.searchMovies.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/movies/search')
        .query({ query: 'test' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 