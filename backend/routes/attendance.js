import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getAttendance,
  getAttendanceById,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByCourse,
  getAttendanceByStudent,
  getAttendanceStats,
  getStudentsForAttendance,
  bulkMarkAttendance
} from '../controllers/attendanceController.js';
import {
  generateDailyAttendanceReminders,
  getAttendanceNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../services/attendanceNotificationService.js';
import { protect, adminOnly, teacherOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Admin, Faculty)
router.get('/', protect, teacherOrAdmin, getAttendance);

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private
router.get('/:id', protect, getAttendanceById);

// @desc    Mark attendance for students
// @route   POST /api/attendance/mark
// @access  Private (Admin, Faculty)
router.post('/mark', [
  protect,
  teacherOrAdmin,
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('subjectId').optional().isMongoId().withMessage('Valid subject ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Valid year is required'),
  body('attendanceData').isArray().withMessage('Attendance data array is required'),
  body('attendanceData.*.studentId').isMongoId().withMessage('Valid student ID is required'),
  body('attendanceData.*.status').isIn(['present', 'absent', 'late', 'excused', 'leave']).withMessage('Invalid status'),
  body('notes').optional().trim(),
], markAttendance);

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin, Faculty)
router.put('/:id', [
  protect,
  teacherOrAdmin,
  body('status').optional().isIn(['present', 'absent', 'late', 'excused', 'leave']).withMessage('Invalid status'),
  body('checkInTime').optional().isISO8601().withMessage('Valid check-in time is required'),
  body('checkOutTime').optional().isISO8601().withMessage('Valid check-out time is required'),
  body('notes').optional().trim(),
  body('excuseReason').optional().trim(),
], updateAttendance);

// @desc    Delete attendance record (soft delete)
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, deleteAttendance);

// @desc    Get attendance by course
// @route   GET /api/attendance/course/:courseId
// @access  Private
router.get('/course/:courseId', protect, getAttendanceByCourse);

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:studentId
// @access  Private
router.get('/student/:studentId', protect, getAttendanceByStudent);

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (Admin, Faculty)
router.get('/stats', protect, teacherOrAdmin, getAttendanceStats);

// @desc    Get students for attendance marking
// @route   GET /api/attendance/students/:courseId
// @access  Private (Admin, Faculty)
router.get('/students/:courseId', protect, teacherOrAdmin, getStudentsForAttendance);

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private (Admin, Faculty)
router.post('/bulk', [
  protect,
  teacherOrAdmin,
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('subjectId').optional().isMongoId().withMessage('Valid subject ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Valid year is required'),
  body('studentIds').isArray().withMessage('Student IDs array is required'),
  body('status').isIn(['present', 'absent', 'late', 'excused', 'leave']).withMessage('Invalid status'),
  body('notes').optional().trim(),
], bulkMarkAttendance);

// @desc    Get user's own attendance
// @route   GET /api/attendance/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;
    
    const filter = { studentId: req.user.id, isActive: true };
    if (courseId) filter.courseId = courseId;
    if (startDate && endDate) {
      filter.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const attendance = await getAttendanceByStudent(req, res);
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching my attendance'
    });
  }
});

// @desc    Generate daily attendance reminder notifications
// @route   POST /api/attendance/notifications/daily-reminder
// @access  Private (Admin)
router.post('/notifications/daily-reminder', [
  protect,
  adminOnly,
  body('date').isISO8601().withMessage('Valid date is required'),
  body('courseId').optional().isMongoId().withMessage('Valid course ID is required'),
  body('subjectId').optional().isMongoId().withMessage('Valid subject ID is required'),
], generateDailyAttendanceReminders);

// @desc    Get attendance notifications for user
// @route   GET /api/attendance/notifications
// @access  Private
router.get('/notifications', protect, getAttendanceNotifications);

// @desc    Mark notification as read
// @route   PUT /api/attendance/notifications/:id/read
// @access  Private
router.put('/notifications/:id/read', protect, markNotificationAsRead);

// @desc    Mark all notifications as read
// @route   PUT /api/attendance/notifications/mark-all-read
// @access  Private
router.put('/notifications/mark-all-read', protect, markAllNotificationsAsRead);

// @desc    Delete notification
// @route   DELETE /api/attendance/notifications/:id
// @access  Private
router.delete('/notifications/:id', protect, deleteNotification);

export default router;