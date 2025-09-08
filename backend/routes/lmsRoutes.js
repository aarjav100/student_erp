import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';

// Import controllers
import {
  getCourseMaterials,
  getCourseMaterial,
  uploadCourseMaterial,
  updateCourseMaterial,
  deleteCourseMaterial,
  downloadCourseMaterial,
  upload
} from '../controllers/courseMaterialController.js';

import {
  getCourseQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizAttempts,
  getAllQuizAttempts
} from '../controllers/quizController.js';

import {
  getCourseDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addReply,
  updateReply,
  deleteReply,
  voteDiscussion,
  voteReply
} from '../controllers/discussionController.js';

import {
  getStudentProgress,
  getAllStudentProgress,
  updateMaterialProgress,
  updateAssignmentProgress,
  updateQuizProgress,
  getStudentDashboard
} from '../controllers/progressController.js';

import {
  getUserNotifications,
  getNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  createBulkNotifications,
  getNotificationStats,
  getScheduledNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Course Material Routes
router.get('/materials/:courseId', getCourseMaterials);
router.get('/materials/material/:id', getCourseMaterial);
router.post('/materials/upload', 
  upload.single('file'),
  [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('type').isIn(['lecture', 'notes', 'ppt', 'ebook', 'video', 'document', 'assignment', 'quiz'])
      .withMessage('Invalid material type')
  ],
  uploadCourseMaterial
);
router.put('/materials/:id', 
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('type').optional().isIn(['lecture', 'notes', 'ppt', 'ebook', 'video', 'document', 'assignment', 'quiz'])
      .withMessage('Invalid material type')
  ],
  updateCourseMaterial
);
router.delete('/materials/:id', deleteCourseMaterial);
router.get('/materials/:id/download', downloadCourseMaterial);

// Quiz Routes
router.get('/quizzes/:courseId', getCourseQuizzes);
router.get('/quizzes/quiz/:id', getQuiz);
router.post('/quizzes',
  [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
    body('questions.*.questionText').notEmpty().withMessage('Question text is required'),
    body('questions.*.questionType').isIn(['multiple-choice', 'true-false', 'short-answer', 'essay'])
      .withMessage('Invalid question type'),
    body('questions.*.points').isInt({ min: 1 }).withMessage('Points must be a positive integer')
  ],
  createQuiz
);
router.put('/quizzes/:id',
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required')
  ],
  updateQuiz
);
router.delete('/quizzes/:id', deleteQuiz);
router.post('/quizzes/:id/start', startQuizAttempt);
router.post('/quizzes/:id/submit',
  [
    body('answers').isArray().withMessage('Answers array is required')
  ],
  submitQuizAttempt
);
router.get('/quizzes/:id/attempts', getQuizAttempts);
router.get('/quizzes/:id/all-attempts', getAllQuizAttempts);

// Discussion Routes
router.get('/discussions/:courseId', getCourseDiscussions);
router.get('/discussions/discussion/:id', getDiscussion);
router.post('/discussions',
  [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('type').optional().isIn(['question', 'announcement', 'general', 'assignment-help', 'exam-help'])
      .withMessage('Invalid discussion type')
  ],
  createDiscussion
);
router.put('/discussions/:id',
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('type').optional().isIn(['question', 'announcement', 'general', 'assignment-help', 'exam-help'])
      .withMessage('Invalid discussion type')
  ],
  updateDiscussion
);
router.delete('/discussions/:id', deleteDiscussion);
router.post('/discussions/:id/replies',
  [
    body('content').notEmpty().withMessage('Reply content is required')
  ],
  addReply
);
router.put('/discussions/:id/replies/:replyId',
  [
    body('content').optional().notEmpty().withMessage('Reply content cannot be empty')
  ],
  updateReply
);
router.delete('/discussions/:id/replies/:replyId', deleteReply);
router.post('/discussions/:id/vote',
  [
    body('voteType').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote')
  ],
  voteDiscussion
);
router.post('/discussions/:id/replies/:replyId/vote',
  [
    body('voteType').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote')
  ],
  voteReply
);

// Progress Routes
router.get('/progress/:courseId', getStudentProgress);
router.get('/progress/:courseId/all', getAllStudentProgress);
router.put('/progress/:courseId/material/:materialId',
  [
    body('progressPercentage').optional().isInt({ min: 0, max: 100 })
      .withMessage('Progress percentage must be between 0 and 100'),
    body('timeSpent').optional().isInt({ min: 0 })
      .withMessage('Time spent must be a non-negative integer')
  ],
  updateMaterialProgress
);
router.put('/progress/:courseId/assignment/:assignmentId',
  [
    body('status').optional().isIn(['not-started', 'in-progress', 'submitted', 'graded'])
      .withMessage('Invalid assignment status'),
    body('score').optional().isInt({ min: 0 }).withMessage('Score must be a non-negative integer'),
    body('maxScore').optional().isInt({ min: 1 }).withMessage('Max score must be a positive integer')
  ],
  updateAssignmentProgress
);
router.put('/progress/:courseId/quiz/:quizId',
  [
    body('attempts').optional().isInt({ min: 0 }).withMessage('Attempts must be a non-negative integer'),
    body('bestScore').optional().isInt({ min: 0 }).withMessage('Best score must be a non-negative integer'),
    body('bestPercentage').optional().isInt({ min: 0, max: 100 })
      .withMessage('Best percentage must be between 0 and 100'),
    body('status').optional().isIn(['not-started', 'in-progress', 'completed'])
      .withMessage('Invalid quiz status')
  ],
  updateQuizProgress
);
router.get('/progress/dashboard', getStudentDashboard);

// Notification Routes
router.get('/notifications', getUserNotifications);
router.get('/notifications/:id', getNotification);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/:id/unread', markNotificationAsUnread);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.delete('/notifications/:id', deleteNotification);
router.post('/notifications',
  [
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('type').optional().isIn([
      'assignment-due', 'assignment-graded', 'quiz-available', 'quiz-graded',
      'announcement', 'discussion-reply', 'course-material', 'enrollment-approved',
      'enrollment-rejected', 'deadline-reminder', 'grade-update', 'attendance-alert',
      'payment-due', 'system', 'general'
    ]).withMessage('Invalid notification type'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority level')
  ],
  createNotification
);
router.post('/notifications/bulk',
  [
    body('recipientIds').isArray({ min: 1 }).withMessage('Recipient IDs array is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('type').optional().isIn([
      'assignment-due', 'assignment-graded', 'quiz-available', 'quiz-graded',
      'announcement', 'discussion-reply', 'course-material', 'enrollment-approved',
      'enrollment-rejected', 'deadline-reminder', 'grade-update', 'attendance-alert',
      'payment-due', 'system', 'general'
    ]).withMessage('Invalid notification type'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority level')
  ],
  createBulkNotifications
);
router.get('/notifications/stats', getNotificationStats);
router.get('/notifications/scheduled', getScheduledNotifications);

export default router;
