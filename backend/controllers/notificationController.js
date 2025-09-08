import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { validationResult } from 'express-validator';

// @desc    Get user notifications
// @route   GET /api/lms/notifications
// @access  Private
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, priority, isRead } = req.query;
    const userId = req.user.id;

    // Build query
    const query = { recipientId: userId, isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('senderId', 'name email')
      .populate('courseId', 'title courseCode')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipientId: userId, isRead: false, isActive: true });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notifications'
    });
  }
};

// @desc    Get single notification
// @route   GET /api/lms/notifications/:id
// @access  Private
export const getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('senderId', 'name email')
      .populate('courseId', 'title courseCode');

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.recipientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this notification'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notification'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/lms/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.recipientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this notification'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking notification as read'
    });
  }
};

// @desc    Mark notification as unread
// @route   PUT /api/lms/notifications/:id/unread
// @access  Private
export const markNotificationAsUnread = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.recipientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this notification'
      });
    }

    await notification.markAsUnread();

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as unread'
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking notification as unread'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/lms/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipientId: userId, isRead: false, isActive: true },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking all notifications as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/lms/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.recipientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this notification'
      });
    }

    // Soft delete
    notification.isActive = false;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting notification'
    });
  }
};

// @desc    Create notification (Admin/Teacher only)
// @route   POST /api/lms/notifications
// @access  Private (Admin/Teacher only)
export const createNotification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check if user has permission to create notifications
    const user = await User.findById(req.user.id);
    if (!['teacher', 'admin', 'faculty', 'professor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create notifications'
      });
    }

    const {
      recipientId,
      courseId,
      title,
      message,
      type,
      priority,
      actionUrl,
      actionText,
      metadata,
      scheduledFor
    } = req.body;

    const notificationData = {
      recipientId,
      senderId: req.user.id,
      courseId,
      title,
      message,
      type: type || 'general',
      priority: priority || 'medium',
      actionUrl,
      actionText,
      metadata,
      isScheduled: !!scheduledFor,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
    };

    const notification = new Notification(notificationData);
    await notification.save();

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating notification'
    });
  }
};

// @desc    Create bulk notifications (Admin/Teacher only)
// @route   POST /api/lms/notifications/bulk
// @access  Private (Admin/Teacher only)
export const createBulkNotifications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check if user has permission to create notifications
    const user = await User.findById(req.user.id);
    if (!['teacher', 'admin', 'faculty', 'professor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create bulk notifications'
      });
    }

    const { recipientIds, courseId, title, message, type, priority, actionUrl, actionText, metadata } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Recipient IDs array is required'
      });
    }

    const notifications = recipientIds.map(recipientId => ({
      recipientId,
      senderId: req.user.id,
      courseId,
      title,
      message,
      type: type || 'general',
      priority: priority || 'medium',
      actionUrl,
      actionText,
      metadata
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      data: createdNotifications,
      message: `${createdNotifications.length} notifications created successfully`
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating bulk notifications'
    });
  }
};

// @desc    Get notification statistics
// @route   GET /api/lms/notifications/stats
// @access  Private
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Notification.aggregate([
      { $match: { recipientId: userId, isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$isRead', false] }, 1, 0]
            }
          },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead'
            }
          },
          byPriority: {
            $push: {
              priority: '$priority',
              isRead: '$isRead'
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          unread: 0,
          byType: {},
          byPriority: {}
        }
      });
    }

    const stat = stats[0];
    
    // Process type statistics
    const typeStats = {};
    stat.byType.forEach(item => {
      if (!typeStats[item.type]) {
        typeStats[item.type] = { total: 0, unread: 0 };
      }
      typeStats[item.type].total++;
      if (!item.isRead) {
        typeStats[item.type].unread++;
      }
    });

    // Process priority statistics
    const priorityStats = {};
    stat.byPriority.forEach(item => {
      if (!priorityStats[item.priority]) {
        priorityStats[item.priority] = { total: 0, unread: 0 };
      }
      priorityStats[item.priority].total++;
      if (!item.isRead) {
        priorityStats[item.priority].unread++;
      }
    });

    res.json({
      success: true,
      data: {
        total: stat.total,
        unread: stat.unread,
        byType: typeStats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notification statistics'
    });
  }
};

// @desc    Get scheduled notifications (Admin/Teacher only)
// @route   GET /api/lms/notifications/scheduled
// @access  Private (Admin/Teacher only)
export const getScheduledNotifications = async (req, res) => {
  try {
    // Check if user has permission
    const user = await User.findById(req.user.id);
    if (!['teacher', 'admin', 'faculty', 'professor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view scheduled notifications'
      });
    }

    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({
      isScheduled: true,
      isActive: true,
      scheduledFor: { $gte: new Date() }
    })
      .populate('recipientId', 'name email')
      .populate('senderId', 'name email')
      .populate('courseId', 'title courseCode')
      .sort({ scheduledFor: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments({
      isScheduled: true,
      isActive: true,
      scheduledFor: { $gte: new Date() }
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching scheduled notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching scheduled notifications'
    });
  }
};
