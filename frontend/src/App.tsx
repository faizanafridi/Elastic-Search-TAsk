import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { MovieCard } from './components/MovieCard';
import { api } from './services/api';
import { Movie } from './types/movie';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSearch = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await api.searchMovies(query);
      setMovies(result.results);
    } catch (err) {
      setError('Failed to search movies');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app" data-testid="app">
      <h1>Movie Search</h1>
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      
      {error && <div className="error" data-testid="error-message">{error}</div>}
      
      <div className="movies-grid" data-testid="movies-grid">
        {movies.map(movie => (
          <MovieCard key={movie.imdbID} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default App; 