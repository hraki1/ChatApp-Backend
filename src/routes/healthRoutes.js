const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', healthController.getHealth);

// @route   GET /api/health/detailed
// @desc    Detailed system health check
// @access  Public
router.get('/detailed', healthController.getDetailedHealth);

module.exports = router;
