const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// @route   GET /api/messages/recent/:userId
// @desc    Get recent messages for a user
// @access  Public
router.get('/recent/:userId', messageController.getRecentMessages);

// @route   GET /api/messages/stats/:userId
// @desc    Get message statistics for a user
// @access  Public
router.get('/stats/:userId', messageController.getMessageStats);

// @route   GET /api/messages/:senderId/:receiverId
// @desc    Get messages between two users
// @access  Public
router.get('/:senderId/:receiverId', messageController.getMessagesBetweenUsers);

// @route   POST /api/messages
// @desc    Create a new message
// @access  Public
router.post('/', messageController.createMessage);

// @route   DELETE /api/messages/:messageId/:userId
// @desc    Delete a message
// @access  Public
router.delete('/:messageId/:userId', messageController.deleteMessage);

module.exports = router;
