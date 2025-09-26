const User = require('../models/User');
const Message = require('../models/Message');
const logger = require('../utils/logger');

class SocketController {
  constructor() {
    this.activeUsers = new Map();
    this.io = null;
  }

  initialize(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.id}`);

      // Join user to their personal room
      socket.on('join', (userId) => {
        this.handleUserJoin(socket, userId);
      });

      // Handle sending messages
      socket.on('sendMessage', (data) => {
        this.handleSendMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        this.handleTyping(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleUserDisconnect(socket);
      });
    });
  }

  async handleUserJoin(socket, userId) {
    try {
      socket.join(userId);
      this.activeUsers.set(userId, socket.id);
      
      // Update user online status
      await User.findOneAndUpdate(
        { userId },
        { isOnline: true, lastSeen: new Date() },
        { new: true }
      );
      
      // Broadcast user online status to all users
      this.io.emit('userStatusUpdate', { userId, isOnline: true });
      
      logger.info(`User joined: ${userId}`);
    } catch (error) {
      logger.error('Error handling user join:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { senderId, receiverId, message } = data;
      
      // Save message to database
      const newMessage = new Message({
        senderId,
        receiverId,
        message: message.trim()
      });
      
      await newMessage.save();
      
      // Send message to receiver
      socket.to(receiverId).emit('receiveMessage', newMessage);
      
      // Send confirmation to sender
      socket.emit('messageSent', newMessage);
      
      logger.info(`Message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTyping(socket, data) {
    const { senderId, receiverId, isTyping } = data;
    socket.to(receiverId).emit('userTyping', {
      senderId,
      isTyping
    });
  }

  async handleUserDisconnect(socket) {
    try {
      logger.info(`User disconnected: ${socket.id}`);
      
      // Find and remove user from active users
      for (const [userId, socketId] of this.activeUsers.entries()) {
        if (socketId === socket.id) {
          this.activeUsers.delete(userId);
          
          // Update user offline status
          await User.findOneAndUpdate(
            { userId },
            { isOnline: false, lastSeen: new Date() }
          );
          
          // Broadcast user offline status
          this.io.emit('userStatusUpdate', { userId, isOnline: false });
          
          logger.info(`User left: ${userId}`);
          break;
        }
      }
    } catch (error) {
      logger.error('Error handling user disconnect:', error);
    }
  }

  getActiveUsers() {
    return Array.from(this.activeUsers.keys());
  }

  isUserOnline(userId) {
    return this.activeUsers.has(userId);
  }

  // Broadcast message to all users
  broadcastMessage(message) {
    this.io.emit('broadcastMessage', message);
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    this.io.to(userId).emit(event, data);
  }
}

module.exports = new SocketController();
