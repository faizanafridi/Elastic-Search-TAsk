import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { SearchBar } from '../SearchBar';
import '@testing-library/jest-dom';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onSearch with trimmed query when submitted', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByTestId('search-input');
    const form = screen.getByTestId('search-form');

    fireEvent.change(input, { target: { value: '  test query  ' } });
    fireEvent.submit(form);

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('should not call onSearch when query is empty', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const form = screen.getByTestId('search-form');
    fireEvent.submit(form);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should disable input and button when loading', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);

    const input = screen.getByTestId('search-input');
    const button = screen.getByTestId('search-button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Searching...');
  });

  it('should disable search button when input is empty', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const button = screen.getByTestId('search-button');
    expect(button).toBeDisabled();

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: '  ' } });
    expect(button).toBeDisabled();

    fireEvent.change(input, { target: { value: 'test' } });
    expect(button).not.toBeDisabled();
  });
}); 