import { api } from '../api';
import { Movie } from '../../types/movie';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchMovies', () => {
    it('should fetch movies successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              title: 'Test Movie',
              year: '2020',
              director: 'Test Director',
              plot: 'Test Plot',
              poster: 'test.jpg',
              imdbID: 'tt1234567'
            }
          ],
          count: 1,
          processingTime: '100ms'
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await api.searchMovies('test');
      
      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/movies/search'),
        expect.objectContaining({
          params: { query: 'test' }
        })
      );
    });

    it('should handle search error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(api.searchMovies('test'))
        .rejects.toThrow('Failed to search movies');
    });
  });

  describe('fetchMovies', () => {
    it('should fetch initial movies successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Movies fetched successfully',
          processingTime: '200ms'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await api.fetchMovies();
      
      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/movies/fetch')
      );
    });

    it('should handle fetch error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(api.fetchMovies())
        .rejects.toThrow('Failed to fetch movies');
    });
  });
}); 