const Redis = require('ioredis');
const logger = require('../config/logger');
const config = require('../config/config');

class RedisService {
  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      enableOfflineQueue: false
    });

    this.defaultTTL = config.redis.ttl;

    // Handle Redis connection errors
    this.client.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message });
    });
  }

  async disconnect() {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error('Redis disconnect error', { error: error.message });
    }
  }

  createCacheKey(query) {
    return `search:${query.toLowerCase().trim()}`;
  }

  async get(query) {
    try {
      const key = this.createCacheKey(query);
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Redis get error', { error: error.message });
      throw error; // Let the controller handle the error
    }
  }

  async set(query, results) {
    try {
      const key = this.createCacheKey(query);
      await this.client.setex(key, this.defaultTTL, JSON.stringify(results));
    } catch (error) {
      logger.error('Redis set error', { error: error.message });
      throw error; // Let the controller handle the error
    }
  }

  async clearCache() {
    try {
      const keys = await this.client.keys('search:*');
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Redis clear cache error', { error: error.message });
      throw error; // Let the controller handle the error
    }
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  await redisService.disconnect();
});

const redisService = new RedisService();
module.exports = redisService; 