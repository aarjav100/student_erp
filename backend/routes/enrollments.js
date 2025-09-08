import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getEnrollmentsByCourse,
  getEnrollmentsByStudent,
  getEnrollmentStats,
  bulkEnrollStudents
} from '../controllers/enrollmentController.js';
import { protect, adminOnly, teacherOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private (Admin, Faculty)
router.get('/', protect, teacherOrAdmin, getEnrollments);

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private
router.get('/:id', protect, getEnrollment);

// @desc    Create new enrollment
// @route   POST /api/enrollments
// @access  Private (Faculty, Admin)
router.post('/', [
  protect,
  teacherOrAdmin,
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Valid year is required'),
  body('notes').optional().trim(),
], createEnrollment);

// @desc    Update enrollment
// @route   PUT /api/enrollments/:id
// @access  Private (Admin, Faculty)
router.put('/:id', [
  protect,
  teacherOrAdmin,
  body('status').optional().isIn(['pending', 'enrolled', 'dropped', 'completed', 'suspended']).withMessage('Invalid status'),
  body('grade').optional().trim(),
  body('notes').optional().trim(),
  body('dropReason').optional().trim(),
], updateEnrollment);

// @desc    Delete enrollment (soft delete)
// @route   DELETE /api/enrollments/:id
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, deleteEnrollment);

// @desc    Get enrollments by course
// @route   GET /api/enrollments/course/:courseId
// @access  Private
router.get('/course/:courseId', protect, getEnrollmentsByCourse);

// @desc    Get enrollments by student
// @route   GET /api/enrollments/student/:studentId
// @access  Private
router.get('/student/:studentId', protect, getEnrollmentsByStudent);

// @desc    Get enrollment statistics
// @route   GET /api/enrollments/stats
// @access  Private (Admin, Faculty)
router.get('/stats', protect, teacherOrAdmin, getEnrollmentStats);

// @desc    Bulk enroll students
// @route   POST /api/enrollments/bulk
// @access  Private (Admin, Faculty)
router.post('/bulk', [
  protect,
  teacherOrAdmin,
  body('enrollments').isArray().withMessage('Enrollments array is required'),
  body('enrollments.*.studentId').isMongoId().withMessage('Valid student ID is required'),
  body('enrollments.*.courseId').isMongoId().withMessage('Valid course ID is required'),
  body('enrollments.*.semester').trim().notEmpty().withMessage('Semester is required'),
  body('enrollments.*.year').isInt({ min: 2020, max: 2030 }).withMessage('Valid year is required'),
  body('enrollments.*.notes').optional().trim(),
], bulkEnrollStudents);

// @desc    Get user's own enrollments
// @route   GET /api/enrollments/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const enrollments = await getEnrollmentsByStudent(req, res);
  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching my enrollments'
    });
  }
});

export default router;