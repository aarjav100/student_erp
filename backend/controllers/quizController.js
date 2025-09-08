import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

// @desc    Get all quizzes for a course
// @route   GET /api/lms/quizzes/:courseId
// @access  Private
export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { courseId, isActive: true };
    
    if (status === 'active') {
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    } else if (status === 'upcoming') {
      query.startDate = { $gt: new Date() };
    } else if (status === 'completed') {
      query.endDate = { $lt: new Date() };
    }

    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching quizzes'
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/lms/quizzes/quiz/:id
// @access  Private
export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('courseId', 'title courseCode');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Check if user is teacher/admin or student
    const user = await User.findById(req.user.id);
    const isTeacher = ['teacher', 'admin', 'faculty', 'professor'].includes(user.role);

    // For students, don't show correct answers if quiz is still active
    if (!isTeacher && quiz.showCorrectAnswers && new Date() < quiz.endDate) {
      quiz.questions = quiz.questions.map(question => ({
        ...question.toObject(),
        correctAnswer: undefined,
        explanation: undefined
      }));
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching quiz'
    });
  }
};

// @desc    Create new quiz
// @route   POST /api/lms/quizzes
// @access  Private (Teacher/Admin only)
export const createQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check if user has permission to create quizzes
    const user = await User.findById(req.user.id);
    if (!['teacher', 'admin', 'faculty', 'professor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create quizzes'
      });
    }

    const quizData = {
      ...req.body,
      createdBy: req.user.id
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    // Create notification for enrolled students
    await createQuizNotification(quiz.courseId, quiz._id, quiz.title, quiz.startDate);

    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating quiz'
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/lms/quizzes/:id
// @access  Private (Teacher/Admin only)
export const updateQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Check permissions
    if (quiz.createdBy.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this quiz'
      });
    }

    // Don't allow updates if quiz has started and has attempts
    const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
    if (attemptCount > 0 && new Date() >= quiz.startDate) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update quiz that has already started with attempts'
      });
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    res.json({
      success: true,
      data: quiz,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating quiz'
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/lms/quizzes/:id
// @access  Private (Teacher/Admin only)
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Check permissions
    if (quiz.createdBy.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this quiz'
      });
    }

    // Check if quiz has attempts
    const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
    if (attemptCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete quiz that has attempts. Consider deactivating instead.'
      });
    }

    // Soft delete
    quiz.isActive = false;
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting quiz'
    });
  }
};

// @desc    Start quiz attempt
// @route   POST /api/lms/quizzes/:id/start
// @access  Private
export const startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Check if quiz is active
    const now = new Date();
    if (now < quiz.startDate) {
      return res.status(400).json({
        success: false,
        error: 'Quiz has not started yet'
      });
    }

    if (now > quiz.endDate) {
      return res.status(400).json({
        success: false,
        error: 'Quiz has ended'
      });
    }

    // Check existing attempts
    const existingAttempts = await QuizAttempt.find({
      quizId: quiz._id,
      studentId: req.user.id
    }).sort({ attemptNumber: -1 });

    if (existingAttempts.length >= quiz.attemptsAllowed) {
      return res.status(400).json({
        success: false,
        error: 'Maximum attempts reached for this quiz'
      });
    }

    // Check if there's an in-progress attempt
    const inProgressAttempt = existingAttempts.find(attempt => attempt.status === 'in-progress');
    if (inProgressAttempt) {
      return res.status(400).json({
        success: false,
        error: 'You have an in-progress attempt. Please complete it first.'
      });
    }

    const attemptNumber = existingAttempts.length + 1;

    const attempt = new QuizAttempt({
      quizId: quiz._id,
      studentId: req.user.id,
      courseId: quiz.courseId,
      maxScore: quiz.totalPoints,
      attemptNumber,
      timeStarted: now,
      status: 'in-progress'
    });

    await attempt.save();

    res.status(201).json({
      success: true,
      data: attempt,
      message: 'Quiz attempt started successfully'
    });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while starting quiz attempt'
    });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/lms/quizzes/:id/submit
// @access  Private
export const submitQuizAttempt = async (req, res) => {
  try {
    const { answers } = req.body;
    const quizId = req.params.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Find the in-progress attempt
    const attempt = await QuizAttempt.findOne({
      quizId,
      studentId: req.user.id,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(400).json({
        success: false,
        error: 'No active quiz attempt found'
      });
    }

    // Check if quiz is still active
    const now = new Date();
    if (now > quiz.endDate) {
      attempt.status = 'timeout';
      attempt.timeCompleted = now;
      await attempt.save();
      
      return res.status(400).json({
        success: false,
        error: 'Quiz time has expired'
      });
    }

    // Process answers and calculate score
    let totalScore = 0;
    const processedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) return answer;

      let isCorrect = false;
      let pointsEarned = 0;

      if (question.questionType === 'multiple-choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = answer.selectedOptions && answer.selectedOptions.includes(correctOption.text);
      } else if (question.questionType === 'true-false') {
        isCorrect = answer.answer === question.correctAnswer;
      } else if (question.questionType === 'short-answer') {
        isCorrect = answer.answer && answer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      }

      if (isCorrect) {
        pointsEarned = question.points;
        totalScore += question.points;
      }

      return {
        ...answer,
        isCorrect,
        pointsEarned
      };
    });

    // Update attempt
    attempt.answers = processedAnswers;
    attempt.totalScore = totalScore;
    attempt.timeCompleted = now;
    attempt.status = 'completed';
    attempt.isGraded = true;
    attempt.gradedAt = now;

    await attempt.save();

    // Create notification for grade
    await createQuizGradeNotification(quiz.courseId, quiz._id, quiz.title, attempt.totalScore, attempt.maxScore);

    res.json({
      success: true,
      data: attempt,
      message: 'Quiz submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while submitting quiz attempt'
    });
  }
};

// @desc    Get quiz attempts for a student
// @route   GET /api/lms/quizzes/:id/attempts
// @access  Private
export const getQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      quizId: req.params.id,
      studentId: req.user.id
    }).sort({ attemptNumber: -1 });

    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching quiz attempts'
    });
  }
};

// @desc    Get all quiz attempts for a quiz (Teacher/Admin only)
// @route   GET /api/lms/quizzes/:id/all-attempts
// @access  Private (Teacher/Admin only)
export const getAllQuizAttempts = async (req, res) => {
  try {
    // Check if user has permission
    const user = await User.findById(req.user.id);
    if (!['teacher', 'admin', 'faculty', 'professor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view all attempts'
      });
    }

    const attempts = await QuizAttempt.find({ quizId: req.params.id })
      .populate('studentId', 'name email studentId')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('Error fetching all quiz attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching quiz attempts'
    });
  }
};

// Helper function to create quiz notification
const createQuizNotification = async (courseId, quizId, title, startDate) => {
  try {
    // Get all enrolled students
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const enrollments = await Enrollment.find({ courseId, status: 'enrolled' });
    
    const notifications = enrollments.map(enrollment => ({
      recipientId: enrollment.studentId,
      courseId,
      title: 'New Quiz Available',
      message: `A new quiz "${title}" is now available.`,
      type: 'quiz-available',
      priority: 'high',
      actionUrl: `/courses/${courseId}/quizzes/${quizId}`,
      actionText: 'Take Quiz',
      metadata: { quizId, startDate }
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating quiz notification:', error);
  }
};

// Helper function to create quiz grade notification
const createQuizGradeNotification = async (courseId, quizId, title, score, maxScore) => {
  try {
    const percentage = Math.round((score / maxScore) * 100);
    
    await Notification.create({
      recipientId: req.user.id,
      courseId,
      title: 'Quiz Graded',
      message: `Your quiz "${title}" has been graded. Score: ${score}/${maxScore} (${percentage}%)`,
      type: 'quiz-graded',
      priority: 'medium',
      actionUrl: `/courses/${courseId}/quizzes/${quizId}/results`,
      actionText: 'View Results',
      metadata: { quizId, score, maxScore }
    });
  } catch (error) {
    console.error('Error creating quiz grade notification:', error);
  }
};
