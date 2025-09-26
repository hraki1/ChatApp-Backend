const Message = require('../models/Message');
const { validateMessage } = require('../utils/validation');
const logger = require('../utils/logger');

class MessageController {
  // @desc    Get messages between two users
  // @route   GET /api/messages/:senderId/:receiverId
  // @access  Public
  async getMessagesBetweenUsers(req, res, next) {
    try {
      const { senderId, receiverId } = req.params;
      const messages = await Message.find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }).sort({ timestamp: 1 });

      logger.info(`Retrieved ${messages.length} messages between ${senderId} and ${receiverId}`);
      res.json({
        success: true,
        count: messages.length,
        messages
      });
    } catch (error) {
      logger.error('Error fetching messages:', error);
      next(error);
    }
  }

  // @desc    Get recent messages for a user
  // @route   GET /api/messages/recent/:userId
  // @access  Public
  async getRecentMessages(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      const messages = await Message.find({
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

      logger.info(`Retrieved ${messages.length} recent messages for user ${userId}`);
      res.json({
        success: true,
        count: messages.length,
        messages
      });
    } catch (error) {
      logger.error('Error fetching recent messages:', error);
      next(error);
    }
  }

  // @desc    Create a new message
  // @route   POST /api/messages
  // @access  Public
  async createMessage(req, res, next) {
    try {
      const { senderId, receiverId, message } = req.body;

      // Validate message data
      const validation = validateMessage({ senderId, receiverId, message });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const newMessage = new Message({
        senderId,
        receiverId,
        message: message.trim()
      });

      await newMessage.save();

      logger.info(`New message created from ${senderId} to ${receiverId}`);
      res.status(201).json({
        success: true,
        message: newMessage
      });
    } catch (error) {
      logger.error('Error creating message:', error);
      next(error);
    }
  }

  // @desc    Delete a message
  // @route   DELETE /api/messages/:messageId/:userId
  // @access  Public
  async deleteMessage(req, res, next) {
    try {
      const { messageId, userId } = req.params;

      const message = await Message.findOneAndDelete({
        _id: messageId,
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Message not found or unauthorized'
        });
      }

      logger.info(`Message deleted: ${messageId} by user ${userId}`);
      res.json({
        success: true,
        message: 'Message deleted successfully',
        deletedMessage: message
      });
    } catch (error) {
      logger.error('Error deleting message:', error);
      next(error);
    }
  }

  // @desc    Get message statistics
  // @route   GET /api/messages/stats/:userId
  // @access  Public
  async getMessageStats(req, res, next) {
    try {
      const { userId } = req.params;

      const totalMessages = await Message.countDocuments({
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      });

      const sentMessages = await Message.countDocuments({
        senderId: userId
      });

      const receivedMessages = await Message.countDocuments({
        receiverId: userId
      });

      logger.info(`Retrieved message stats for user ${userId}`);
      res.json({
        success: true,
        stats: {
          totalMessages,
          sentMessages,
          receivedMessages
        }
      });
    } catch (error) {
      logger.error('Error fetching message stats:', error);
      next(error);
    }
  }
}

module.exports = new MessageController();
