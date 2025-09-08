import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByCourse,
  getSubjectsByInstructor,
  getSubjectStats
} from '../controllers/subjectController.js';
import { protect, adminOnly, teacherOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private (Admin/Faculty)
router.get('/', protect, teacherOrAdmin, getSubjects);

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Private
router.get('/:id', protect, getSubject);

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin/Faculty)
router.post('/', [
  protect,
  teacherOrAdmin,
  body('name').notEmpty().withMessage('Subject name is required'),
  body('code').notEmpty().withMessage('Subject code is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('instructor').optional().isMongoId().withMessage('Invalid instructor ID'),
  body('prerequisites').optional().isArray().withMessage('Prerequisites must be an array'),
  body('objectives').optional().isArray().withMessage('Objectives must be an array'),
  body('outcomes').optional().isArray().withMessage('Outcomes must be an array'),
  body('textbooks').optional().isArray().withMessage('Textbooks must be an array'),
  body('references').optional().isArray().withMessage('References must be an array'),
  body('assessment.internal').optional().isInt({ min: 0, max: 100 }).withMessage('Internal assessment must be between 0 and 100'),
  body('assessment.external').optional().isInt({ min: 0, max: 100 }).withMessage('External assessment must be between 0 and 100'),
  body('schedule.lectures').optional().isInt({ min: 0 }).withMessage('Lecture hours must be non-negative'),
  body('schedule.tutorials').optional().isInt({ min: 0 }).withMessage('Tutorial hours must be non-negative'),
  body('schedule.practicals').optional().isInt({ min: 0 }).withMessage('Practical hours must be non-negative'),
  body('maxStudents').optional().isInt({ min: 1 }).withMessage('Max students must be at least 1'),
  body('minStudents').optional().isInt({ min: 1 }).withMessage('Min students must be at least 1'),
  body('isElective').optional().isBoolean().withMessage('isElective must be boolean'),
], createSubject);

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin/Faculty)
router.put('/:id', [
  protect,
  teacherOrAdmin,
  body('name').optional().notEmpty().withMessage('Subject name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Subject code cannot be empty'),
  body('credits').optional().isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('year').optional().isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('instructor').optional().isMongoId().withMessage('Invalid instructor ID'),
  body('prerequisites').optional().isArray().withMessage('Prerequisites must be an array'),
  body('objectives').optional().isArray().withMessage('Objectives must be an array'),
  body('outcomes').optional().isArray().withMessage('Outcomes must be an array'),
  body('textbooks').optional().isArray().withMessage('Textbooks must be an array'),
  body('references').optional().isArray().withMessage('References must be an array'),
  body('assessment.internal').optional().isInt({ min: 0, max: 100 }).withMessage('Internal assessment must be between 0 and 100'),
  body('assessment.external').optional().isInt({ min: 0, max: 100 }).withMessage('External assessment must be between 0 and 100'),
  body('schedule.lectures').optional().isInt({ min: 0 }).withMessage('Lecture hours must be non-negative'),
  body('schedule.tutorials').optional().isInt({ min: 0 }).withMessage('Tutorial hours must be non-negative'),
  body('schedule.practicals').optional().isInt({ min: 0 }).withMessage('Practical hours must be non-negative'),
  body('maxStudents').optional().isInt({ min: 1 }).withMessage('Max students must be at least 1'),
  body('minStudents').optional().isInt({ min: 1 }).withMessage('Min students must be at least 1'),
  body('isElective').optional().isBoolean().withMessage('isElective must be boolean'),
  body('status').optional().isIn(['active', 'inactive', 'archived']).withMessage('Invalid status'),
], updateSubject);

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, deleteSubject);

// @desc    Get subjects by course
// @route   GET /api/subjects/course/:courseId
// @access  Private
router.get('/course/:courseId', protect, getSubjectsByCourse);

// @desc    Get subjects by instructor
// @route   GET /api/subjects/instructor/:instructorId
// @access  Private
router.get('/instructor/:instructorId', protect, getSubjectsByInstructor);

// @desc    Get subject statistics
// @route   GET /api/subjects/stats
// @access  Private (Admin/Faculty)
router.get('/stats', protect, teacherOrAdmin, getSubjectStats);

export default router;
