const redisService = {
  client: {
    quit: jest.fn().mockResolvedValue('OK')
  },
  get: jest.fn().mockImplementation(() => Promise.resolve(null)),
  set: jest.fn().mockImplementation(() => Promise.resolve('OK')),
  clearCache: jest.fn().mockImplementation(() => Promise.resolve()),
  createCacheKey: jest.fn(query => `search:${query.toLowerCase().trim()}`),
  disconnect: jest.fn().mockImplementation(() => Promise.resolve())
};

module.exports = redisService; 