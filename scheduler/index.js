const axios = require('axios');
const cron = require('node-cron');

const API_URL = process.env.API_URL || 'http://localhost/api/movies/fetch';

// Function to fetch movies
async function fetchMovies() {
  try {
    console.log(`Running movie fetch at ${new Date().toISOString()}`);
    const response = await axios.post(API_URL);
    console.log('Fetch completed:', response.data);
  } catch (error) {
    console.error('Fetch failed:', error.message);
  }
}

// Run immediately when the service starts
console.log('Scheduler starting...');
fetchMovies().then(() => {
  console.log('Initial fetch completed');
});

// Schedule task to run at midnight every day (00:00)
cron.schedule('0 0 * * *', fetchMovies, {
  timezone: "UTC"
});

console.log('Scheduler running. Next fetch at midnight UTC');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Scheduler shutting down...');
  process.exit(0);
}); 