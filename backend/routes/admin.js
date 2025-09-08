import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    // Get user counts by role
    const userCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get course statistics
    const totalCourses = await Course.countDocuments({ isActive: true });
    const totalEnrollments = await Enrollment.countDocuments({ status: 'enrolled' });
    const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({ status: 'pending' })
      .populate('studentId', 'name email studentId')
      .populate('courseId', 'title courseCode')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent users
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        userCounts,
        totalCourses,
        totalEnrollments,
        pendingEnrollments,
        recentEnrollments,
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching dashboard data',
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching users',
    });
  }
});

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private/Admin
router.post('/users', [
  protect,
  adminOnly,
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher', 'admin', 'faculty', 'professor']).withMessage('Invalid role'),
  body('studentId').optional().trim(),
  body('phone').optional().trim(),
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

    const { name, email, password, role, studentId, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      studentId,
      phone,
      status: 'active',
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: { ...user.toObject(), password: undefined } },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating user',
    });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', [
  protect,
  adminOnly,
  body('name').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['student', 'teacher', 'admin', 'faculty', 'professor']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('studentId').optional().trim(),
  body('phone').optional().trim(),
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

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating user',
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting user',
    });
  }
});

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
router.get('/courses', protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching courses',
    });
  }
});

// @desc    Get all enrollments
// @route   GET /api/admin/enrollments
// @access  Private/Admin
router.get('/enrollments', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const enrollments = await Enrollment.find(query)
      .populate('studentId', 'name email studentId')
      .populate('courseId', 'title courseCode')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error('Get admin enrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching enrollments',
    });
  }
});

export default router; 