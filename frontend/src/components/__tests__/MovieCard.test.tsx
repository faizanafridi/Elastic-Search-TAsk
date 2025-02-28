import React from 'react';
import { render, screen } from '@testing-library/react';
import { MovieCard } from '../MovieCard';
import { Movie } from '../../types/movie';
import '@testing-library/jest-dom';

describe('MovieCard', () => {
  const mockMovie: Movie = {
    title: 'Test Movie',
    year: '2020',
    director: 'Test Director',
    plot: 'Test Plot',
    poster: 'test.jpg',
    imdbID: 'tt1234567'
  };

  it('should render movie details correctly', () => {
    render(<MovieCard movie={mockMovie} />);

    expect(screen.getByTestId('movie-title')).toHaveTextContent(mockMovie.title);
    expect(screen.getByTestId('movie-director')).toHaveTextContent(mockMovie.director);
    expect(screen.getByTestId('movie-plot')).toHaveTextContent(mockMovie.plot);
    expect(screen.getByTestId('movie-poster')).toHaveAttribute('src', mockMovie.poster);
    expect(screen.getByTestId('movie-poster')).toHaveAttribute('alt', mockMovie.title);
  });
}); 