import AttendanceNotification from '../models/AttendanceNotification.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Generate daily attendance reminder notifications
// @route   POST /api/attendance/notifications/daily-reminder
// @access  Private (Admin)
export const generateDailyAttendanceReminders = async (req, res) => {
  try {
    const { date, courseId, subjectId } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    const attendanceDate = new Date(date);
    const notifications = [];

    // Get all active courses
    const courses = courseId ? 
      await Course.find({ _id: courseId, isActive: true }) :
      await Course.find({ isActive: true });

    for (const course of courses) {
      // Get enrolled students for this course
      const enrollments = await Enrollment.find({
        courseId: course._id,
        status: 'enrolled',
        isActive: true
      }).populate('studentId', 'name email');

      for (const enrollment of enrollments) {
        // Check if notification already exists for this date
        const existingNotification = await AttendanceNotification.findOne({
          type: 'daily_reminder',
          recipientId: enrollment.studentId._id,
          courseId: course._id,
          date: attendanceDate,
          isActive: true
        });

        if (!existingNotification) {
          const notification = new AttendanceNotification({
            type: 'daily_reminder',
            title: 'Daily Attendance Reminder',
            message: `Don't forget to attend ${course.courseCode} - ${course.title} today!`,
            recipientId: enrollment.studentId._id,
            courseId: course._id,
            subjectId: subjectId || null,
            date: attendanceDate,
            priority: 'medium',
            metadata: {
              courseCode: course.courseCode,
              courseTitle: course.title,
              reminderDate: attendanceDate
            }
          });

          await notification.save();
          notifications.push(notification);
        }
      }
    }

    res.json({
      success: true,
      data: {
        notificationsGenerated: notifications.length,
        notifications
      },
      message: `Generated ${notifications.length} daily attendance reminders`
    });
  } catch (error) {
    console.error('Generate daily reminders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while generating daily reminders'
    });
  }
};

// @desc    Send attendance marked notification
// @route   POST /api/attendance/notifications/attendance-marked
// @access  Private (Admin, Faculty)
export const sendAttendanceMarkedNotification = async (studentId, courseId, subjectId, status, date, markedBy) => {
  try {
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);
    const marker = await User.findById(markedBy);

    if (!student || !course || !marker) {
      throw new Error('Required data not found');
    }

    const notification = new AttendanceNotification({
      type: 'attendance_marked',
      title: 'Attendance Marked',
      message: `Your attendance for ${course.courseCode} has been marked as ${status} by ${marker.name}`,
      recipientId: studentId,
      courseId: courseId,
      subjectId: subjectId,
      date: new Date(date),
      priority: 'low',
      metadata: {
        status,
        markedBy: marker.name,
        courseCode: course.courseCode,
        courseTitle: course.title
      }
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Send attendance marked notification error:', error);
    throw error;
  }
};

// @desc    Send low attendance alert
// @route   POST /api/attendance/notifications/low-attendance-alert
// @access  Private (Admin, Faculty)
export const sendLowAttendanceAlert = async (studentId, courseId, attendancePercentage) => {
  try {
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      throw new Error('Required data not found');
    }

    const notification = new AttendanceNotification({
      type: 'low_attendance_alert',
      title: 'Low Attendance Alert',
      message: `Your attendance in ${course.courseCode} is ${attendancePercentage}%. Please improve your attendance.`,
      recipientId: studentId,
      courseId: courseId,
      date: new Date(),
      priority: attendancePercentage < 50 ? 'urgent' : 'high',
      metadata: {
        attendancePercentage,
        courseCode: course.courseCode,
        courseTitle: course.title
      }
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Send low attendance alert error:', error);
    throw error;
  }
};

// @desc    Get attendance notifications for user
// @route   GET /api/attendance/notifications
// @access  Private
export const getAttendanceNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, isRead } = req.query;
    
    const filter = { 
      recipientId: req.user.id, 
      isActive: true 
    };
    
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await AttendanceNotification.find(filter)
      .populate('courseId', 'title courseCode')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AttendanceNotification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get attendance notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notifications'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/attendance/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await AttendanceNotification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipientId: req.user.id,
        isActive: true 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/attendance/notifications/mark-all-read
// @access  Private
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await AttendanceNotification.updateMany(
      { 
        recipientId: req.user.id,
        isRead: false,
        isActive: true 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking all notifications as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/attendance/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await AttendanceNotification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipientId: req.user.id,
        isActive: true 
      },
      { isActive: false },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting notification'
    });
  }
};
