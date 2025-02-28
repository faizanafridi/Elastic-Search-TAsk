const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.post('/fetch', movieController.fetchMovies);
router.get('/search', movieController.searchMovies);

module.exports = router; 