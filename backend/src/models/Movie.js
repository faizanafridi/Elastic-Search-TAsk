const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: String,
    required: true
  },
  director: {
    type: String,
    index: true
  },
  plot: {
    type: String,
    index: true
  },
  poster: {
    type: String
  },
  imdbID: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema); 