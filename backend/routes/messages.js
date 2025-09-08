import express from 'express';
import { body, validationResult } from 'express-validator';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's messages
// @route   GET /api/messages
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, isRead } = req.query;
    const query = { $or: [{ senderId: req.user.id }, { recipientId: req.user.id }] };

    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const messages = await Message.find(query)
      .populate('senderId', 'name email')
      .populate('recipientId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching messages',
    });
  }
});

// @desc    Get message by ID
// @route   GET /api/messages/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('senderId', 'name email')
      .populate('recipientId', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Check if user has permission to view this message
    if (message.senderId._id.toString() !== req.user.id && 
        message.recipientId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view this message',
      });
    }

    // Mark as read if recipient is viewing
    if (message.recipientId._id.toString() === req.user.id && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching message',
    });
  }
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private
router.post('/', [
  protect,
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').optional().isIn(['general', 'academic', 'administrative', 'urgent']).withMessage('Invalid message type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array(),
      });
    }

    const { recipientId, subject, content, type = 'general' } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
      });
    }

    const message = new Message({
      senderId: req.user.id,
      recipientId,
      subject,
      content,
      type,
    });

    await message.save();

    // Populate the response
    await message.populate('senderId', 'name email');
    await message.populate('recipientId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error sending message',
    });
  }
});

// @desc    Mark message as read
// @route   PATCH /api/messages/:id/read
// @access  Private
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findOne({ 
      _id: req.params.id, 
      recipientId: req.user.id 
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or you do not have permission to mark it as read',
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message,
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error marking message as read',
    });
  }
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findOne({ 
      _id: req.params.id, 
      $or: [{ senderId: req.user.id }, { recipientId: req.user.id }] 
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or you do not have permission to delete it',
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting message',
    });
  }
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({ 
      recipientId: req.user.id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching unread count',
    });
  }
});

export default router;