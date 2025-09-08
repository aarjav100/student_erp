import Discussion from '../models/Discussion.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

// @desc    Get all discussions for a course
// @route   GET /api/lms/discussions/:courseId
// @access  Private
export const getCourseDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { courseId, isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Prioritize pinned discussions
    if (sortBy === 'createdAt') {
      sort.isPinned = -1;
    }

    const discussions = await Discussion.find(query)
      .populate('author', 'name email avatarUrl')
      .populate('upvotes.user', 'name')
      .populate('downvotes.user', 'name')
      .populate('replies.author', 'name email avatarUrl')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Discussion.countDocuments(query);

    res.json({
      success: true,
      data: {
        discussions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching discussions'
    });
  }
};

// @desc    Get single discussion
// @route   GET /api/lms/discussions/discussion/:id
// @access  Private
export const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name email avatarUrl')
      .populate('upvotes.user', 'name')
      .populate('downvotes.user', 'name')
      .populate('replies.author', 'name email avatarUrl')
      .populate('replies.upvotes.user', 'name')
      .populate('replies.downvotes.user', 'name');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    // Increment view count
    discussion.views += 1;
    await discussion.save();

    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching discussion'
    });
  }
};

// @desc    Create new discussion
// @route   POST /api/lms/discussions
// @access  Private
export const createDiscussion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { courseId, title, content, type, tags, attachments } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const discussionData = {
      courseId,
      title,
      content,
      type: type || 'general',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      attachments: attachments || [],
      author: req.user.id
    };

    const discussion = new Discussion(discussionData);
    await discussion.save();

    // Populate author information
    await discussion.populate('author', 'name email avatarUrl');

    // Create notification for course members (except author)
    await createDiscussionNotification(courseId, discussion._id, title, req.user.id);

    res.status(201).json({
      success: true,
      data: discussion,
      message: 'Discussion created successfully'
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating discussion'
    });
  }
};

// @desc    Update discussion
// @route   PUT /api/lms/discussions/:id
// @access  Private
export const updateDiscussion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    // Check permissions
    if (discussion.author.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this discussion'
      });
    }

    const { title, content, type, tags, attachments, isPinned, isLocked } = req.body;
    
    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.type = type || discussion.type;
    discussion.tags = tags ? tags.split(',').map(tag => tag.trim()) : discussion.tags;
    discussion.attachments = attachments || discussion.attachments;
    
    // Only teachers/admins can pin/lock discussions
    const user = await User.findById(req.user.id);
    if (['teacher', 'admin', 'faculty', 'professor'].includes(user.role)) {
      discussion.isPinned = isPinned !== undefined ? isPinned : discussion.isPinned;
      discussion.isLocked = isLocked !== undefined ? isLocked : discussion.isLocked;
    }

    await discussion.save();

    res.json({
      success: true,
      data: discussion,
      message: 'Discussion updated successfully'
    });
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating discussion'
    });
  }
};

// @desc    Delete discussion
// @route   DELETE /api/lms/discussions/:id
// @access  Private
export const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    // Check permissions
    if (discussion.author.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this discussion'
      });
    }

    // Soft delete
    discussion.isActive = false;
    await discussion.save();

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting discussion'
    });
  }
};

// @desc    Add reply to discussion
// @route   POST /api/lms/discussions/:id/replies
// @access  Private
export const addReply = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    if (discussion.isLocked) {
      return res.status(400).json({
        success: false,
        error: 'This discussion is locked and cannot receive new replies'
      });
    }

    const { content, attachments, isSolution } = req.body;

    const reply = {
      author: req.user.id,
      content,
      attachments: attachments || [],
      isSolution: isSolution || false
    };

    // If marking as solution, unmark other solutions
    if (isSolution) {
      discussion.replies.forEach(r => r.isSolution = false);
    }

    discussion.replies.push(reply);
    await discussion.save();

    // Populate the new reply
    await discussion.populate('replies.author', 'name email avatarUrl');

    const newReply = discussion.replies[discussion.replies.length - 1];

    // Create notification for discussion author (if not the same person)
    if (discussion.author.toString() !== req.user.id) {
      await createReplyNotification(discussion.courseId, discussion._id, discussion.title, req.user.id, discussion.author);
    }

    res.status(201).json({
      success: true,
      data: newReply,
      message: 'Reply added successfully'
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding reply'
    });
  }
};

// @desc    Update reply
// @route   PUT /api/lms/discussions/:id/replies/:replyId
// @access  Private
export const updateReply = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        error: 'Reply not found'
      });
    }

    // Check permissions
    if (reply.author.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this reply'
      });
    }

    const { content, attachments, isSolution } = req.body;
    
    reply.content = content || reply.content;
    reply.attachments = attachments || reply.attachments;
    reply.updatedAt = new Date();

    // Only teachers/admins can mark as solution
    const user = await User.findById(req.user.id);
    if (['teacher', 'admin', 'faculty', 'professor'].includes(user.role)) {
      if (isSolution !== undefined) {
        if (isSolution) {
          // Unmark other solutions
          discussion.replies.forEach(r => r.isSolution = false);
        }
        reply.isSolution = isSolution;
      }
    }

    await discussion.save();

    res.json({
      success: true,
      data: reply,
      message: 'Reply updated successfully'
    });
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating reply'
    });
  }
};

// @desc    Delete reply
// @route   DELETE /api/lms/discussions/:id/replies/:replyId
// @access  Private
export const deleteReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        error: 'Reply not found'
      });
    }

    // Check permissions
    if (reply.author.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this reply'
      });
    }

    reply.remove();
    await discussion.save();

    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting reply'
    });
  }
};

// @desc    Vote on discussion
// @route   POST /api/lms/discussions/:id/vote
// @access  Private
export const voteDiscussion = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    const userId = req.user.id;
    
    // Remove existing votes
    discussion.upvotes = discussion.upvotes.filter(vote => vote.user.toString() !== userId);
    discussion.downvotes = discussion.downvotes.filter(vote => vote.user.toString() !== userId);

    // Add new vote
    if (voteType === 'upvote') {
      discussion.upvotes.push({ user: userId });
    } else if (voteType === 'downvote') {
      discussion.downvotes.push({ user: userId });
    }

    await discussion.save();

    res.json({
      success: true,
      data: {
        upvotes: discussion.upvotes.length,
        downvotes: discussion.downvotes.length,
        voteCount: discussion.upvotes.length - discussion.downvotes.length
      },
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error voting on discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while voting on discussion'
    });
  }
};

// @desc    Vote on reply
// @route   POST /api/lms/discussions/:id/replies/:replyId/vote
// @access  Private
export const voteReply = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        error: 'Reply not found'
      });
    }

    const userId = req.user.id;
    
    // Remove existing votes
    reply.upvotes = reply.upvotes.filter(vote => vote.user.toString() !== userId);
    reply.downvotes = reply.downvotes.filter(vote => vote.user.toString() !== userId);

    // Add new vote
    if (voteType === 'upvote') {
      reply.upvotes.push({ user: userId });
    } else if (voteType === 'downvote') {
      reply.downvotes.push({ user: userId });
    }

    await discussion.save();

    res.json({
      success: true,
      data: {
        upvotes: reply.upvotes.length,
        downvotes: reply.downvotes.length,
        voteCount: reply.upvotes.length - reply.downvotes.length
      },
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error voting on reply:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while voting on reply'
    });
  }
};

// Helper function to create discussion notification
const createDiscussionNotification = async (courseId, discussionId, title, authorId) => {
  try {
    // Get all enrolled students except the author
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const enrollments = await Enrollment.find({ 
      courseId, 
      status: 'enrolled',
      studentId: { $ne: authorId }
    });
    
    const notifications = enrollments.map(enrollment => ({
      recipientId: enrollment.studentId,
      courseId,
      title: 'New Discussion Posted',
      message: `A new discussion "${title}" has been posted in your course.`,
      type: 'discussion-reply',
      priority: 'low',
      actionUrl: `/courses/${courseId}/discussions/${discussionId}`,
      actionText: 'View Discussion',
      metadata: { discussionId }
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating discussion notification:', error);
  }
};

// Helper function to create reply notification
const createReplyNotification = async (courseId, discussionId, title, replyAuthorId, discussionAuthorId) => {
  try {
    await Notification.create({
      recipientId: discussionAuthorId,
      courseId,
      title: 'New Reply to Your Discussion',
      message: `Someone replied to your discussion "${title}".`,
      type: 'discussion-reply',
      priority: 'medium',
      actionUrl: `/courses/${courseId}/discussions/${discussionId}`,
      actionText: 'View Reply',
      metadata: { discussionId }
    });
  } catch (error) {
    console.error('Error creating reply notification:', error);
  }
};
