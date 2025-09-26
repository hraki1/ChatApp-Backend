const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../../config/upload');

// @route   POST /api/users
// @desc    Create a new user
// @access  Public
router.post('/', upload.single('image'), userController.createUser);

// @route   GET /api/users
// @desc    Get all users
// @access  Public
router.get('/', userController.getAllUsers);

// @route   GET /api/users/online/list
// @desc    Get all online users
// @access  Public
router.get('/online/list', userController.getOnlineUsers);

// @route   GET /api/users/:userId
// @desc    Get a specific user by userId
// @access  Public
router.get('/:userId', userController.getUserById);

// @route   PUT /api/users/:userId/status
// @desc    Update user status
// @access  Public
router.put('/:userId/status', userController.updateUserStatus);

// @route   DELETE /api/users/:userId
// @desc    Delete user
// @access  Public
router.delete('/:userId', userController.deleteUser);

module.exports = router;
