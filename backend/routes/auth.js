import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import AdminOTP from '../models/AdminOTP.js';
import { sendOTP, verifyOTP } from '../utils/email.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper function to get user profile
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Helper function to update user profile
const updateUserProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').optional().isIn(['student', 'faculty', 'hod', 'admin', 'staff']),
  body('course').optional().trim(),
  body('branch').optional().trim(),
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

    const { email, password, firstName, lastName, studentId, phone, role, course, branch } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Validate role-based requirements
    if (['student', 'faculty', 'hod'].includes(role) && (!course || !branch)) {
      return res.status(400).json({
        success: false,
        error: 'Course and Branch are required for students, faculty, and HOD',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      studentId,
      phone,
      role: role || 'student',
      course,
      branch,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          course: user.course,
          branch: user.branch,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration',
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
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

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          course: user.course,
          branch: user.branch,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login',
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // For JWT-based auth, logout is handled client-side by removing the token
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout',
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          course: req.user.course,
          branch: req.user.branch,
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user data',
    });
  }
});

// @desc    Send OTP for admin login
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
      });
    }

    const { email } = req.body;

    // Check if user exists and has admin privileges
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!['admin', 'faculty', 'hod'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await AdminOTP.create({
      email,
      otp,
      expiresAt,
    });

    // Send OTP via email
    try {
      const emailResult = await sendOTP(email, otp);
      console.log('📧 Admin OTP email sent successfully:', emailResult.messageId);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      // Delete the stored OTP if email fails
      await AdminOTP.deleteOne({ email });
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP email. Please try again.',
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: {
        email: email,
        expiresIn: '10 minutes',
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error sending OTP',
    });
  }
});

// @desc    Verify OTP for admin login
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP format',
      });
    }

    const { email, otp } = req.body;

    // Verify OTP
    const otpData = await AdminOTP.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    // Delete used OTP
    await AdminOTP.deleteOne({ email });

    // Create or get admin user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        password: Math.random().toString(36).slice(-12), // Random password
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error verifying OTP',
    });
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, async (req, res) => {
  try {
    const token = generateToken(req.user.id);

    res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error refreshing token',
    });
  }
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
router.post('/change-password', [
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    // Get client IP address
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Check if new password is same as current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password',
      });
    }

    // Update password and track the change
    user.password = newPassword;
    user.lastLoginIP = clientIP;
    await user.trackPasswordChange();

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: {
        changedAt: user.passwordChangedAt,
        securityNote: 'Password change has been logged for security purposes'
      }
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error changing password',
    });
  }
});

// @desc    Admin login (password or OTP)
// @route   POST /api/auth/admin-login
// @access  Public
router.post('/admin-login', [
  body('email').isEmail().normalizeEmail(),
  body('password').optional(),
  body('otp').optional(),
  body('loginMethod').isIn(['password', 'otp']),
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

    const { email, password, otp, loginMethod } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if user has admin privileges
    if (!['admin', 'faculty', 'hod'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    let isAuthenticated = false;

    if (loginMethod === 'password') {
      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required for password login',
        });
      }
      // Verify password
      isAuthenticated = await user.comparePassword(password);
    } else if (loginMethod === 'otp') {
      if (!otp) {
        return res.status(400).json({
          success: false,
          error: 'OTP is required for OTP login',
        });
      }
      // Verify OTP
      const otpData = await AdminOTP.findOne({
        email,
        otp,
        expiresAt: { $gt: new Date() }
      });

      if (!otpData) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired OTP',
        });
      }

      // Delete used OTP
      await AdminOTP.deleteOne({ email });
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          course: user.course,
          branch: user.branch,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during admin login',
    });
  }
});

export default router; 