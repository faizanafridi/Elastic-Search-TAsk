import React from 'react';
import { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="movie-card" data-testid="movie-card">
      <img 
        src={movie.poster} 
        alt={movie.title} 
        data-testid="movie-poster"
      />
      <h3 data-testid="movie-title">{movie.title}</h3>
      <p data-testid="movie-director">Director: {movie.director}</p>
      <p data-testid="movie-plot">{movie.plot}</p>
    </div>
  );
}; 