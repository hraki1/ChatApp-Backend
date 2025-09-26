const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const { validateUser } = require('../utils/validation');
const logger = require('../utils/logger');

class UserController {
  // @desc    Create a new user
  // @route   POST /api/users
  // @access  Public
  async createUser(req, res, next) {
    try {
      const { name } = req.body;
      
      if (!name || !req.file) {
        return res.status(400).json({ 
          error: 'Name and image are required' 
        });
      }

      const userData = {
        name: name.trim(),
        image: req.file.filename
      };

      // Validate user data
      const validation = validateUser(userData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const userId = uuidv4();
      const user = new User({
        ...userData,
        userId
      });

      await user.save();
      
      logger.info(`New user created: ${user.name} (${userId})`);
      res.status(201).json({ 
        success: true,
        user, 
        userId: user.userId 
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      next(error);
    }
  }

  // @desc    Get all users
  // @route   GET /api/users
  // @access  Public
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      
      logger.info(`Retrieved ${users.length} users`);
      res.json({
        success: true,
        count: users.length,
        users
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      next(error);
    }
  }

  // @desc    Get a specific user by userId
  // @route   GET /api/users/:userId
  // @access  Public
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await User.findOne({ userId });
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      logger.info(`User retrieved: ${user.name} (${userId})`);
      res.json({
        success: true,
        user
      });
    } catch (error) {
      logger.error('Error fetching user:', error);
      next(error);
    }
  }

  // @desc    Get all online users
  // @route   GET /api/users/online/list
  // @access  Public
  async getOnlineUsers(req, res, next) {
    try {
      const users = await User.find({ isOnline: true });
      
      logger.info(`Retrieved ${users.length} online users`);
      res.json({
        success: true,
        count: users.length,
        users
      });
    } catch (error) {
      logger.error('Error fetching online users:', error);
      next(error);
    }
  }

  // @desc    Update user status
  // @route   PUT /api/users/:userId/status
  // @access  Public
  async updateUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { isOnline } = req.body;

      const user = await User.findOneAndUpdate(
        { userId },
        { 
          isOnline,
          lastSeen: new Date()
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      logger.info(`User status updated: ${user.name} - ${isOnline ? 'Online' : 'Offline'}`);
      res.json({
        success: true,
        user
      });
    } catch (error) {
      logger.error('Error updating user status:', error);
      next(error);
    }
  }

  // @desc    Delete user
  // @route   DELETE /api/users/:userId
  // @access  Public
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await User.findOneAndDelete({ userId });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      logger.info(`User deleted: ${user.name} (${userId})`);
      res.json({
        success: true,
        message: 'User deleted successfully',
        user
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      next(error);
    }
  }
}

module.exports = new UserController();
