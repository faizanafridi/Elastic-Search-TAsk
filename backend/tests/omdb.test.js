const axios = require('axios');
const OmdbService = require('../src/services/omdbService');
const logger = require('../src/config/logger');

jest.mock('axios');
jest.mock('../src/config/logger');

describe('OmdbService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchMoviesPage', () => {
    it('should fetch a page of movies successfully', async () => {
      const mockResponse = {
        data: {
          Search: [{ Title: 'Space Movie', Year: '2020' }],
          totalResults: '1'
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      const result = await OmdbService.searchMoviesPage('space', '2020', 1);
      expect(result).toEqual({
        movies: mockResponse.data.Search,
        totalResults: 1
      });
    });

    it('should handle errors when fetching a page', async () => {
      const error = new Error('API Error');
      axios.get.mockRejectedValue(error);

      await expect(async () => {
        await OmdbService.searchMoviesPage('space', '2020', 1);
      }).rejects.toThrow('API Error');
    });

    it('should handle missing Search array', async () => {
      const mockResponse = {
        data: {
          Response: 'False',
          Error: 'Movie not found!'
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      const result = await OmdbService.searchMoviesPage('space', '2020', 1);
      expect(result).toEqual({
        movies: [],
        totalResults: 0
      });
    });
  });

  describe('searchMovies', () => {
    it('should fetch and combine all pages of movies', async () => {
      const mockResponses = [
        {
          data: {
            Search: [{ Title: 'Space Movie 1', Year: '2020' }],
            totalResults: '2'
          }
        },
        {
          data: {
            Search: [{ Title: 'Space Movie 2', Year: '2020' }],
            totalResults: '2'
          }
        }
      ];

      axios.get
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1]);

      const result = await OmdbService.searchMovies('space', '2020',1);
      expect(result).toHaveLength(2);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle invalid totalResults response', async () => {
      const mockResponse = {
        data: {
          Search: [{ Title: 'Space Movie', Year: '2020' }],
          totalResults: 'invalid'
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      const result = await OmdbService.searchMovies('space', '2020');
      expect(result).toHaveLength(1); // Should still return the movies from first page
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        data: {
          Response: 'False',
          Error: 'Movie not found!'
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      const result = await OmdbService.searchMovies('space', '2020');
      expect(result).toHaveLength(0);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMovieDetails', () => {
    it('should fetch movie details successfully', async () => {
      const mockMovie = {
        data: {
          Title: 'Space Movie',
          Year: '2020',
          Director: 'John Doe',
          Plot: 'A movie about space',
          Poster: 'poster.jpg',
          imdbID: 'tt1234567'
        }
      };
      axios.get.mockResolvedValue(mockMovie);

      const result = await OmdbService.getMovieDetails('tt1234567');
      expect(result).toEqual(mockMovie.data);
    });

    it('should handle errors when fetching movie details', async () => {
      const error = new Error('API Error');
      axios.get.mockRejectedValue(error);

      await expect(async () => {
        await OmdbService.getMovieDetails('tt1234567');
      }).rejects.toThrow('API Error');
    });
  });
});