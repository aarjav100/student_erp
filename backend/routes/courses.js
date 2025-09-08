import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  getCoursesByDepartment
} from '../controllers/courseController.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import { protect, adminOnly, teacherOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
router.get('/', protect, getCourses);

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
router.get('/:id', protect, getCourse);

// @desc    Create new course (admin/teacher only)
// @route   POST /api/courses
// @access  Private/Admin/Teacher
router.post('/', [
  protect,
  teacherOrAdmin,
  body('courseCode').trim().notEmpty().withMessage('Course code is required'),
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('department').isIn(['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MCA', 'MBA', 'BBA', 'BCA']).withMessage('Invalid department'),
  body('degree').isIn(['BTech', 'MTech', 'MCA', 'MBA', 'BBA', 'BCA', 'BE', 'ME']).withMessage('Invalid degree'),
  body('duration').isInt({ min: 1, max: 6 }).withMessage('Duration must be between 1 and 6 years'),
  body('totalCredits').isInt({ min: 120, max: 200 }).withMessage('Total credits must be between 120 and 200'),
  body('maxStudents').optional().isInt({ min: 10 }).withMessage('Max students must be at least 10'),
  body('hod').optional().isMongoId().withMessage('Invalid HOD ID'),
  body('coordinator').optional().isMongoId().withMessage('Invalid coordinator ID'),
], createCourse);

// @desc    Update course (admin/teacher only)
// @route   PUT /api/courses/:id
// @access  Private/Admin/Teacher
router.put('/:id', [
  protect,
  teacherOrAdmin,
  body('courseCode').optional().trim().notEmpty().withMessage('Course code cannot be empty'),
  body('title').optional().trim().notEmpty().withMessage('Course title cannot be empty'),
  body('department').optional().isIn(['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MCA', 'MBA', 'BBA', 'BCA']).withMessage('Invalid department'),
  body('degree').optional().isIn(['BTech', 'MTech', 'MCA', 'MBA', 'BBA', 'BCA', 'BE', 'ME']).withMessage('Invalid degree'),
  body('duration').optional().isInt({ min: 1, max: 6 }).withMessage('Duration must be between 1 and 6 years'),
  body('totalCredits').optional().isInt({ min: 120, max: 200 }).withMessage('Total credits must be between 120 and 200'),
  body('maxStudents').optional().isInt({ min: 10 }).withMessage('Max students must be at least 10'),
  body('hod').optional().isMongoId().withMessage('Invalid HOD ID'),
  body('coordinator').optional().isMongoId().withMessage('Invalid coordinator ID'),
  body('status').optional().isIn(['active', 'inactive', 'archived']).withMessage('Invalid status'),
], updateCourse);

// @desc    Delete course (admin only)
// @route   DELETE /api/courses/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, deleteCourse);

// @desc    Get enrolled courses for current user
// @route   GET /api/courses/enrolled
// @access  Private
router.get('/enrolled', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ 
      studentId: req.user.id, 
      status: 'enrolled' 
    })
      .populate('courseId', 'title courseCode credits instructor')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching enrolled courses',
    });
  }
});

// @desc    Get course assignments
// @route   GET /api/courses/:id/assignments
// @access  Private
router.get('/:id/assignments', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      courseId: req.params.id,
      isActive: true 
    })
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching assignments',
    });
  }
});

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private (Admin/Faculty)
router.get('/stats', protect, teacherOrAdmin, getCourseStats);

// @desc    Get courses by department
// @route   GET /api/courses/department/:department
// @access  Private
router.get('/department/:department', protect, getCoursesByDepartment);

export default router;