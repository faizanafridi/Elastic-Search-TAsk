const axios = require('axios');
const cron = require('node-cron');

class MovieFetchScheduler {
  constructor() {
    this.API_URL = process.env.API_URL || 'http://localhost/api/movies/fetch';
    this.maxRetries = 5;
    this.retryDelay = 10000; // 10 seconds
    this.initialized = false;
  }

  async fetchMovies(isInitialFetch = false) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Attempting movie fetch...`);

    try {
      const response = await axios.post(this.API_URL);
      console.log(`[${timestamp}] Fetch completed successfully:`, response.data);
      if (isInitialFetch) this.initialized = true;
      return true;
    } catch (error) {
      console.error(`[${timestamp}] Fetch failed:`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  }

  async retryInitialFetch(attempt = 1) {
    if (attempt > this.maxRetries) {
      console.error('Max retries reached for initial fetch. Continuing with schedule...');
      this.initialized = true; // Mark as initialized despite failure
      return;
    }

    console.log(`Initial fetch attempt ${attempt}/${this.maxRetries}`);
    const success = await this.fetchMovies(true);

    if (!success) {
      console.log(`Retrying in ${this.retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      await this.retryInitialFetch(attempt + 1);
    }
  }

  start() {
    console.log('Movie Fetch Scheduler starting...');

    // Initial fetch with retries
    this.retryInitialFetch()
      .then(() => {
        console.log('Initial fetch process completed, scheduling daily updates');
        
        // Schedule daily fetch at midnight UTC
        cron.schedule('0 0 * * *', () => this.fetchMovies(), {
          timezone: "UTC",
          scheduled: true
        });

        console.log('Scheduler running. Next fetch at midnight UTC');
      })
      .catch(error => {
        console.error('Fatal error in scheduler:', error);
        process.exit(1);
      });

    // Handle graceful shutdown
    this.setupGracefulShutdown();
  }

  setupGracefulShutdown() {
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      process.exit(0);
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
  }
}

// Start the scheduler
const scheduler = new MovieFetchScheduler();
scheduler.start(); 