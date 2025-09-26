const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const messageRoutes = require('./messageRoutes');
const healthRoutes = require('./healthRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/health', healthRoutes);

module.exports = router;
