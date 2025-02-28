import axios from 'axios';
import { Movie, SearchResponse } from '../types/movie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = {
  async searchMovies(query: string): Promise<SearchResponse> {
    try {
      const response = await axios.get<SearchResponse>(`${API_URL}/api/movies/search`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to search movies');
    }
  },

  async fetchMovies(): Promise<{ message: string; processingTime: string }> {
    try {
      const response = await axios.post(`${API_URL}/api/movies/fetch`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch movies');
    }
  }
}; 