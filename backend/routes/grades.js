import express from 'express';
import { body, validationResult } from 'express-validator';
import Grade from '../models/Grade.js';
import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, adminOnly, teacherOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's grades
// @route   GET /api/grades/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.user.id })
      .populate('assignmentId', 'title type dueDate')
      .populate('courseId', 'title courseCode')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    console.error('Get my grades error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching grades',
    });
  }
});

// @desc    Get all grades (admin/teacher only)
// @route   GET /api/grades
// @access  Private/Admin/Teacher
router.get('/', protect, teacherOrAdmin, async (req, res) => {
  try {
    const { courseId, assignmentId, studentId } = req.query;
    const query = {};

    if (courseId) query.courseId = courseId;
    if (assignmentId) query.assignmentId = assignmentId;
    if (studentId) query.studentId = studentId;

    const grades = await Grade.find(query)
      .populate('studentId', 'name email studentId')
      .populate('assignmentId', 'title type dueDate')
      .populate('courseId', 'title courseCode')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching grades',
    });
  }
});

// @desc    Create or update grade (admin/teacher only)
// @route   POST /api/grades
// @access  Private/Admin/Teacher
router.post('/', [
  protect,
  teacherOrAdmin,
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('assignmentId').notEmpty().withMessage('Assignment ID is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('score').isNumeric().withMessage('Score must be a number'),
  body('maxScore').isNumeric().withMessage('Max score must be a number'),
  body('feedback').optional().trim(),
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

    const { studentId, assignmentId, courseId, score, maxScore, feedback } = req.body;

    // Check if grade already exists
    let grade = await Grade.findOne({ studentId, assignmentId });

    if (grade) {
      // Update existing grade
      grade.score = score;
      grade.maxScore = maxScore;
      grade.feedback = feedback;
      grade.updatedAt = new Date();
    } else {
      // Create new grade
      grade = new Grade({
        studentId,
        assignmentId,
        courseId,
        score,
        maxScore,
        feedback,
        gradedBy: req.user.id,
      });
    }

    await grade.save();

    // Populate the response
    await grade.populate('studentId', 'name email studentId');
    await grade.populate('assignmentId', 'title type');
    await grade.populate('courseId', 'title courseCode');

    res.status(201).json({
      success: true,
      message: 'Grade saved successfully',
      data: grade,
    });
  } catch (error) {
    console.error('Create/update grade error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error saving grade',
    });
  }
});

// @desc    Update grade (admin/teacher only)
// @route   PUT /api/grades/:id
// @access  Private/Admin/Teacher
router.put('/:id', [
  protect,
  teacherOrAdmin,
  body('score').optional().isNumeric().withMessage('Score must be a number'),
  body('maxScore').optional().isNumeric().withMessage('Max score must be a number'),
  body('feedback').optional().trim(),
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

    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name email studentId')
      .populate('assignmentId', 'title type')
      .populate('courseId', 'title courseCode');

    if (!grade) {
      return res.status(404).json({
        success: false,
        error: 'Grade not found',
      });
    }

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: grade,
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating grade',
    });
  }
});

// @desc    Delete grade (admin only)
// @route   DELETE /api/grades/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        error: 'Grade not found',
      });
    }

    res.json({
      success: true,
      message: 'Grade deleted successfully',
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting grade',
    });
  }
});

// @desc    Get grade by ID
// @route   GET /api/grades/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('studentId', 'name email studentId')
      .populate('assignmentId', 'title type dueDate')
      .populate('courseId', 'title courseCode');

    if (!grade) {
      return res.status(404).json({
        success: false,
        error: 'Grade not found',
      });
    }

    // Check if user has permission to view this grade
    if (grade.studentId._id.toString() !== req.user.id && 
        !['admin', 'teacher', 'faculty', 'professor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view this grade',
      });
    }

    res.json({
      success: true,
      data: grade,
    });
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching grade',
    });
  }
});

export default router;