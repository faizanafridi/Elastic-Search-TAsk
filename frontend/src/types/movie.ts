export interface Movie {
  title: string;
  year: string;
  director: string;
  plot: string;
  poster: string;
  imdbID: string;
}

export interface SearchResponse {
  results: Movie[];
  count: number;
  processingTime: string;
} 