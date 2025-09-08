import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching profile',
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  protect,
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return new Date(value).toISOString() !== 'Invalid Date';
  }),
  body('emergencyContact').optional().trim(),
  body('address').optional().trim(),
  body('bio').optional().trim(),
  body('studentId').optional().trim(),
  body('yearLevel').optional().isInt({ min: 1, max: 10 }),
  body('program').optional().trim(),
  body('avatarUrl').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }),
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

    // Clean up empty strings - convert them to null/undefined
    const updates = { ...req.body };
    Object.keys(updates).forEach(key => {
      if (updates[key] === '') {
        updates[key] = undefined;
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      updates, 
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating profile',
    });
  }
});

// @desc    Get all students (admin only)
// @route   GET /api/users/students
// @access  Private/Admin
router.get('/students', protect, async (req, res) => {
  try {
    const students = await User.find({ 
      role: 'student', 
      status: 'active' 
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching students',
    });
  }
});

// @desc    Get student by ID (admin only)
// @route   GET /api/users/students/:id
// @access  Private/Admin
router.get('/students/:id', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching student',
    });
  }
});

// @desc    Update student status (admin only)
// @route   PATCH /api/users/students/:id/status
// @access  Private/Admin
router.patch('/students/:id/status', [
  protect,
  body('status').isIn(['active', 'inactive', 'suspended']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value',
      });
    }

    const student = await User.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.json({
      success: true,
      message: 'Student status updated successfully',
      data: student,
    });
  } catch (error) {
    console.error('Update student status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating student status',
    });
  }
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get user's enrollments
    const enrollments = await Enrollment.find({ 
      studentId: req.user.id, 
      status: 'enrolled' 
    })
      .populate('courseId', 'title courseCode credits')
      .sort({ createdAt: -1 });

    // Get user's recent grades
    const grades = await Grade.find({ studentId: req.user.id })
      .populate('assignmentId', 'title type')
      .populate('courseId', 'title courseCode')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user's attendance summary
    const attendance = await Attendance.find({ studentId: req.user.id });

    // Calculate attendance percentage
    const totalSessions = attendance.length;
    const attendedSessions = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    res.json({
      success: true,
      data: {
        enrollments: enrollments || [],
        recentGrades: grades || [],
        attendance: {
          total: totalSessions,
          attended: attendedSessions,
          percentage: Math.round(attendancePercentage * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching dashboard data',
    });
  }
});

export default router; 