const elasticSearchService = {
  client: {
    indices: {
      exists: jest.fn().mockResolvedValue({ body: true }),
      create: jest.fn().mockResolvedValue({ acknowledged: true }),
      delete: jest.fn().mockResolvedValue({ acknowledged: true })
    },
    index: jest.fn().mockResolvedValue({ result: 'created' }),
    search: jest.fn().mockResolvedValue({
      body: {
        hits: {
          hits: []
        }
      }
    })
  },
  init: jest.fn().mockResolvedValue(undefined),
  searchMovies: jest.fn().mockImplementation(() => Promise.resolve([])),
  indexMovie: jest.fn().mockImplementation(() => Promise.resolve()),
  deleteMovie: jest.fn().mockImplementation(() => Promise.resolve()),
  exists: jest.fn().mockImplementation(() => Promise.resolve(false)),
  createIndex: jest.fn().mockResolvedValue(undefined)
};

// Reset helpers
elasticSearchService.searchMovies.mockReset = jest.fn(() => {
  elasticSearchService.searchMovies.mockImplementation(() => Promise.resolve([]));
});

elasticSearchService.indexMovie.mockReset = jest.fn(() => {
  elasticSearchService.indexMovie.mockImplementation(() => Promise.resolve());
});

module.exports = elasticSearchService; 