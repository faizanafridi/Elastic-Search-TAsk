const dotenv = require('dotenv')

const path = require("path");

// Load environment variables from .env
dotenv.config({
  path: path.join(__dirname, "../../../.env")
});

const envVars = process.env;

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'ELASTICSEARCH_NODES', 'REDIS_PASSWORD'];
requiredEnvVars.forEach(envVar => {
  if (!envVars[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const config = {
  app: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  elasticsearch: {
    nodes: process.env.ELASTICSEARCH_NODES?.split(',') || ['http://localhost:9200'],
    index: 'movies'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || 'redispass',
    nodes: process.env.REDIS_NODES?.split(',') || ['localhost:6379'],
    ttl: 3600 * 24 * 10 // 10 days in seconds
  },
  omdb: {
    apiKey: process.env.OMDB_API_KEY || 'eed1dc02',
    baseUrl: 'http://www.omdbapi.com'
  }
};

module.exports = config; 