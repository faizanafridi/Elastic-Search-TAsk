const winston = require('winston');
const path = require('path');

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  trace: 5
};

// Log level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  trace: 'white'
};

winston.addColors(colors);

// Custom format for detailed logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(({ level, message, timestamp, metadata, stack }) => {
    let output = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      output += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
    }
    
    if (stack) {
      output += `\nStack: ${stack}`;
    }
    
    return output;
  })
);

const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'debug',
  format: logFormat,
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat
    }),
    // All logs
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
      format: logFormat
    }),
    // Service specific logs
    new winston.transports.File({
      filename: path.join('logs', 'services.log'),
      maxsize: 5242880,
      maxFiles: 5,
      format: logFormat
    }),
    // API request logs
    new winston.transports.File({
      filename: path.join('logs', 'api.log'),
      maxsize: 5242880,
      maxFiles: 5,
      format: logFormat
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Helper methods for structured logging
logger.api = {
  request: (req, metadata = {}) => {
    logger.http('API Request', {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      ...metadata
    });
  },
  response: (req, res, responseTime, metadata = {}) => {
    logger.http('API Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ...metadata
    });
  }
};

logger.service = {
  start: (serviceName, operation, metadata = {}) => {
    logger.debug(`Starting ${operation}`, {
      service: serviceName,
      operation,
      ...metadata
    });
  },
  end: (serviceName, operation, duration, metadata = {}) => {
    logger.debug(`Completed ${operation}`, {
      service: serviceName,
      operation,
      duration: `${duration}ms`,
      ...metadata
    });
  },
  error: (serviceName, operation, error, metadata = {}) => {
    logger.error(`Error in ${operation}`, {
      service: serviceName,
      operation,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      ...metadata
    });
  }
};

module.exports = logger;