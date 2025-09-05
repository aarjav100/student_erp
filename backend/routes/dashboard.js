import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Attendance from '../models/Attendance.js';
import Fee from '../models/Fee.js';
import Message from '../models/Message.js';

const router = express.Router();

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    // Get user role for role-based data
    const userRole = req.user.role;
    
    // Quick stats based on user role
    let stats = {};
    
    if (userRole === 'admin') {
      // Admin sees all stats
      const [totalStudents, totalFaculty, totalStaff, totalFees, pendingFees] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'faculty' }),
        User.countDocuments({ role: 'staff' }),
        Fee.aggregate([
          { $match: { status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Fee.aggregate([
          { $match: { status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      stats = {
        totalStudents: totalStudents || 0,
        totalFaculty: totalFaculty || 0,
        totalStaff: totalStaff || 0,
        totalFeesCollected: totalFees[0]?.total || 0,
        pendingFees: pendingFees[0]?.total || 0,
        totalUsers: totalStudents + totalFaculty + totalStaff
      };
    } else if (userRole === 'hod') {
      // HOD sees department-specific stats
      const [departmentStudents, departmentFaculty, departmentCourses] = await Promise.all([
        User.countDocuments({ 
          role: 'student', 
          branch: req.user.branch 
        }),
        User.countDocuments({ 
          role: 'faculty', 
          branch: req.user.branch 
        }),
        Course.countDocuments({ branch: req.user.branch })
      ]);

      stats = {
        departmentStudents: departmentStudents || 0,
        departmentFaculty: departmentFaculty || 0,
        departmentCourses: departmentCourses || 0,
        branch: req.user.branch
      };
    } else if (userRole === 'faculty') {
      // Faculty sees class-specific stats
      const [assignedStudents, assignedCourses] = await Promise.all([
        Enrollment.countDocuments({ 
          course: req.user.course,
          branch: req.user.branch 
        }),
        Course.countDocuments({ 
          course: req.user.course,
          branch: req.user.branch 
        })
      ]);

      stats = {
        assignedStudents: assignedStudents || 0,
        assignedCourses: assignedCourses || 0,
        course: req.user.course,
        branch: req.user.branch
      };
    } else if (userRole === 'student') {
      // Student sees personal stats
      const [enrolledCourses, attendancePercentage, pendingFees] = await Promise.all([
        Enrollment.countDocuments({ studentId: req.user._id }),
        Attendance.aggregate([
          { $match: { studentId: req.user._id } },
          { $group: { _id: null, present: { $sum: { $cond: ['$isPresent', 1, 0] } }, total: { $sum: 1 } } }
        ]),
        Fee.aggregate([
          { $match: { studentId: req.user._id, status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      const attendance = attendancePercentage[0];
      const attendancePercent = attendance ? Math.round((attendance.present / attendance.total) * 100) : 0;

      stats = {
        enrolledCourses: enrolledCourses || 0,
        attendancePercentage: attendancePercent,
        pendingFees: pendingFees[0]?.total || 0,
        course: req.user.course,
        branch: req.user.branch
      };
    }

    res.json({
      success: true,
      data: {
        stats,
        userRole,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching dashboard data',
    });
  }
});

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
router.get('/recent-activities', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    let activities = [];

    if (userRole === 'admin') {
      // Admin sees all recent activities
      const [recentUsers, recentEnrollments, recentFees] = await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
        Enrollment.find().sort({ createdAt: -1 }).limit(5).populate('studentId', 'firstName lastName'),
        Fee.find().sort({ createdAt: -1 }).limit(5).populate('studentId', 'firstName lastName')
      ]);

      activities = [
        ...recentUsers.map(user => ({
          type: 'user_registration',
          message: `${user.firstName} ${user.lastName} (${user.role}) registered`,
          timestamp: user.createdAt,
          data: user
        })),
        ...recentEnrollments.map(enrollment => ({
          type: 'course_enrollment',
          message: `${enrollment.studentId.firstName} ${enrollment.studentId.lastName} enrolled in ${enrollment.courseName}`,
          timestamp: enrollment.createdAt,
          data: enrollment
        })),
        ...recentFees.map(fee => ({
          type: 'fee_payment',
          message: `${fee.studentId.firstName} ${fee.studentId.lastName} paid ${fee.amount} for ${fee.feeType}`,
          timestamp: fee.createdAt,
          data: fee
        }))
      ];
    } else if (userRole === 'hod') {
      // HOD sees department activities
      const [departmentEnrollments, departmentAttendance] = await Promise.all([
        Enrollment.find({ branch: req.user.branch }).sort({ createdAt: -1 }).limit(5).populate('studentId', 'firstName lastName'),
        Attendance.find({ branch: req.user.branch }).sort({ createdAt: -1 }).limit(5).populate('studentId', 'firstName lastName')
      ]);

      activities = [
        ...departmentEnrollments.map(enrollment => ({
          type: 'department_enrollment',
          message: `${enrollment.studentId.firstName} ${enrollment.studentId.lastName} enrolled in ${enrollment.courseName}`,
          timestamp: enrollment.createdAt,
          data: enrollment
        })),
        ...departmentAttendance.map(attendance => ({
          type: 'attendance_record',
          message: `${attendance.studentId.firstName} ${attendance.studentId.lastName} marked ${attendance.isPresent ? 'present' : 'absent'}`,
          timestamp: attendance.createdAt,
          data: attendance
        }))
      ];
    } else if (userRole === 'faculty') {
      // Faculty sees class activities
      const [classAttendance, classAssignments] = await Promise.all([
        Attendance.find({ 
          course: req.user.course,
          branch: req.user.branch 
        }).sort({ createdAt: -1 }).limit(5).populate('studentId', 'firstName lastName'),
        // Add assignment model when available
        []
      ]);

      activities = [
        ...classAttendance.map(attendance => ({
          type: 'class_attendance',
          message: `${attendance.studentId.firstName} ${attendance.studentId.lastName} marked ${attendance.isPresent ? 'present' : 'absent'}`,
          timestamp: attendance.createdAt,
          data: attendance
        }))
      ];
    } else if (userRole === 'student') {
      // Student sees personal activities
      const [personalAttendance, personalFees] = await Promise.all([
        Attendance.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(5),
        Fee.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(5)
      ]);

      activities = [
        ...personalAttendance.map(attendance => ({
          type: 'personal_attendance',
          message: `Marked ${attendance.isPresent ? 'present' : 'absent'} in ${attendance.courseName}`,
          timestamp: attendance.createdAt,
          data: attendance
        })),
        ...personalFees.map(fee => ({
          type: 'personal_fee',
          message: `${fee.status === 'paid' ? 'Paid' : 'Pending'} ${fee.amount} for ${fee.feeType}`,
          timestamp: fee.createdAt,
          data: fee
        }))
      ];
    }

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        activities: activities.slice(0, 10), // Limit to 10 most recent
        userRole
      }
    });
  } catch (error) {
    console.error('❌ Recent activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching recent activities',
    });
  }
});

// @desc    Get notifications and alerts
// @route   GET /api/dashboard/notifications
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    let notifications = [];

    if (userRole === 'admin') {
      // Admin notifications
      const [pendingFees, lowAttendance, newUsers] = await Promise.all([
        Fee.countDocuments({ status: 'pending' }),
        Attendance.aggregate([
          { $group: { _id: '$studentId', presentCount: { $sum: { $cond: ['$isPresent', 1, 0] }, totalCount: { $sum: 1 } } } },
          { $match: { $expr: { $lt: [{ $divide: ['$presentCount', '$totalCount'] }, 0.75] } } }
        ]),
        User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      ]);

      if (pendingFees > 0) {
        notifications.push({
          type: 'warning',
          title: 'Pending Fees',
          message: `${pendingFees} students have pending fees`,
          priority: 'high'
        });
      }

      if (lowAttendance.length > 0) {
        notifications.push({
          type: 'warning',
          title: 'Low Attendance Alert',
          message: `${lowAttendance.length} students have attendance below 75%`,
          priority: 'medium'
        });
      }

      if (newUsers > 0) {
        notifications.push({
          type: 'info',
          title: 'New Registrations',
          message: `${newUsers} new users registered in the last 24 hours`,
          priority: 'low'
        });
      }
    } else if (userRole === 'hod') {
      // HOD notifications
      const [departmentPendingFees, departmentLowAttendance] = await Promise.all([
        Fee.countDocuments({ 
          status: 'pending',
          branch: req.user.branch 
        }),
        Attendance.aggregate([
          { $match: { branch: req.user.branch } },
          { $group: { _id: '$studentId', presentCount: { $sum: { $cond: ['$isPresent', 1, 0] }, totalCount: { $sum: 1 } } } },
          { $match: { $expr: { $lt: [{ $divide: ['$presentCount', '$totalCount'] }, 0.75] } } }
        ])
      ]);

      if (departmentPendingFees > 0) {
        notifications.push({
          type: 'warning',
          title: 'Department Pending Fees',
          message: `${departmentPendingFees} students in ${req.user.branch} have pending fees`,
          priority: 'high'
        });
      }

      if (departmentLowAttendance.length > 0) {
        notifications.push({
          type: 'warning',
          title: 'Department Attendance Alert',
          message: `${departmentLowAttendance.length} students in ${req.user.branch} have low attendance`,
          priority: 'medium'
        });
      }
    } else if (userRole === 'faculty') {
      // Faculty notifications
      const [classLowAttendance, upcomingClasses] = await Promise.all([
        Attendance.aggregate([
          { $match: { course: req.user.course, branch: req.user.branch } },
          { $group: { _id: '$studentId', presentCount: { $sum: { $cond: ['$isPresent', 1, 0] }, totalCount: { $sum: 1 } } } },
          { $match: { $expr: { $lt: [{ $divide: ['$presentCount', '$totalCount'] }, 0.75] } } }
        ]),
        // Add timetable logic when available
        []
      ]);

      if (classLowAttendance.length > 0) {
        notifications.push({
          type: 'warning',
          title: 'Class Attendance Alert',
          message: `${classLowAttendance.length} students in your class have low attendance`,
          priority: 'medium'
        });
      }
    } else if (userRole === 'student') {
      // Student notifications
      const [pendingFees, lowAttendance] = await Promise.all([
        Fee.countDocuments({ 
          studentId: req.user._id,
          status: 'pending' 
        }),
        Attendance.aggregate([
          { $match: { studentId: req.user._id } },
          { $group: { _id: null, presentCount: { $sum: { $cond: ['$isPresent', 1, 0] }, totalCount: { $sum: 1 } } } }
        ])
      ]);

      if (pendingFees > 0) {
        notifications.push({
          type: 'warning',
          title: 'Pending Fees',
          message: `You have ${pendingFees} pending fee(s)`,
          priority: 'high'
        });
      }

      const attendance = lowAttendance[0];
      if (attendance && (attendance.presentCount / attendance.totalCount) < 0.75) {
        notifications.push({
          type: 'warning',
          title: 'Low Attendance Warning',
          message: 'Your attendance is below 75%. Please improve your attendance.',
          priority: 'medium'
        });
      }
    }

    res.json({
      success: true,
      data: {
        notifications,
        userRole,
        totalCount: notifications.length
      }
    });
  } catch (error) {
    console.error('❌ Notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching notifications',
    });
  }
});

export default router;
