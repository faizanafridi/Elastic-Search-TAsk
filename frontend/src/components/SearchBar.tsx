import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="search-form">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies..."
        disabled={isLoading}
        data-testid="search-input"
      />
      <button 
        type="submit" 
        disabled={isLoading || !query.trim()}
        data-testid="search-button"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}; 