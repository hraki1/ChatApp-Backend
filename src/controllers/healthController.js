const mongoose = require('mongoose');
const logger = require('../utils/logger');

class HealthController {
  // @desc    Health check endpoint
  // @route   GET /api/health
  // @access  Public
  async getHealth(req, res, next) {
    try {
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      const uptime = process.uptime();
      
      const health = {
        status: 'OK',
        message: 'Chat App API is running',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
        database: {
          status: dbStatus,
          connection: mongoose.connection.readyState
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      };

      logger.info('Health check requested');
      res.json(health);
    } catch (error) {
      logger.error('Error in health check:', error);
      next(error);
    }
  }

  // @desc    Detailed system info
  // @route   GET /api/health/detailed
  // @access  Public
  async getDetailedHealth(req, res, next) {
    try {
      const memUsage = process.memoryUsage();
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      const detailedHealth = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        system: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          uptime: process.uptime()
        },
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
        },
        database: {
          status: dbStatus,
          connection: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        },
        environment: process.env.NODE_ENV || 'development'
      };

      logger.info('Detailed health check requested');
      res.json(detailedHealth);
    } catch (error) {
      logger.error('Error in detailed health check:', error);
      next(error);
    }
  }
}

module.exports = new HealthController();
