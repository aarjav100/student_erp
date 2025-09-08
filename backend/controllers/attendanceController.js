import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import Enrollment from '../models/Enrollment.js';
import { sendAttendanceMarkedNotification } from '../services/attendanceNotificationService.js';

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Admin, Faculty)
export const getAttendance = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      courseId, 
      studentId, 
      subjectId,
      date,
      status,
      semester,
      year,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (courseId) filter.courseId = courseId;
    if (studentId) filter.studentId = studentId;
    if (subjectId) filter.subjectId = subjectId;
    if (status) filter.status = status;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'name email phone program')
      .populate('courseId', 'title courseCode department degree')
      .populate('subjectId', 'name code')
      .populate('markedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(filter);

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching attendance'
    });
  }
};

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('studentId', 'name email phone program')
      .populate('courseId', 'title courseCode department degree')
      .populate('subjectId', 'name code')
      .populate('markedBy', 'name email');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching attendance'
    });
  }
};

// @desc    Mark attendance for students
// @route   POST /api/attendance/mark
// @access  Private (Admin, Faculty)
export const markAttendance = async (req, res) => {
  try {
    const { 
      courseId, 
      subjectId, 
      date, 
      semester, 
      year, 
      attendanceData,
      notes 
    } = req.body;

    // Validate required fields
    if (!courseId || !date || !semester || !year || !attendanceData) {
      return res.status(400).json({
        success: false,
        error: 'Course ID, date, semester, year, and attendance data are required'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if subject exists (if provided)
    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(400).json({
          success: false,
          error: 'Subject not found'
        });
      }
    }

    const attendanceDate = new Date(date);
    const results = [];
    const errors = [];

    // Process each student's attendance
    for (const studentAttendance of attendanceData) {
      try {
        const { studentId, status, checkInTime, notes: studentNotes, excuseReason } = studentAttendance;

        // Check if student exists and is enrolled
        const enrollment = await Enrollment.findOne({
          studentId,
          courseId,
          status: 'enrolled',
          isActive: true
        });

        if (!enrollment) {
          errors.push({
            studentId,
            error: 'Student not enrolled in this course'
          });
          continue;
        }

        // Check if attendance already exists for this date
        const existingAttendance = await Attendance.findOne({
          studentId,
          courseId,
          date: attendanceDate,
          isActive: true
        });

        if (existingAttendance) {
          // Update existing attendance
          existingAttendance.status = status;
          existingAttendance.subjectId = subjectId;
          existingAttendance.markedBy = req.user.id;
          existingAttendance.markedAt = new Date();
          existingAttendance.notes = studentNotes || notes;
          existingAttendance.excuseReason = excuseReason;
          
          if (checkInTime) {
            existingAttendance.checkInTime = new Date(checkInTime);
          }

          // Calculate if late (assuming class starts at 9:00 AM)
          if (status === 'present' && checkInTime) {
            const classStartTime = new Date(attendanceDate);
            classStartTime.setHours(9, 0, 0, 0);
            const checkIn = new Date(checkInTime);
            
            if (checkIn > classStartTime) {
              existingAttendance.isLate = true;
              existingAttendance.lateMinutes = Math.floor((checkIn - classStartTime) / (1000 * 60));
            }
          }

          await existingAttendance.save();
          results.push(existingAttendance);
        } else {
          // Create new attendance record
          const attendance = new Attendance({
            studentId,
            courseId,
            subjectId,
            date: attendanceDate,
            status,
            semester,
            year,
            markedBy: req.user.id,
            notes: studentNotes || notes,
            excuseReason,
            isExcused: status === 'excused',
            isLate: false
          });

          if (checkInTime) {
            attendance.checkInTime = new Date(checkInTime);
            
            // Calculate if late
            const classStartTime = new Date(attendanceDate);
            classStartTime.setHours(9, 0, 0, 0);
            const checkIn = new Date(checkInTime);
            
            if (checkIn > classStartTime) {
              attendance.isLate = true;
              attendance.lateMinutes = Math.floor((checkIn - classStartTime) / (1000 * 60));
            }
          }

          await attendance.save();
          results.push(attendance);
        }
      } catch (error) {
        errors.push({
          studentId: studentAttendance.studentId,
          error: error.message
        });
      }
    }

    // Populate the results
    await Attendance.populate(results, [
      { path: 'studentId', select: 'name email phone program' },
      { path: 'courseId', select: 'title courseCode department degree' },
      { path: 'subjectId', select: 'name code' },
      { path: 'markedBy', select: 'name email' }
    ]);

    // Send notifications for marked attendance
    for (const result of results) {
      try {
        await sendAttendanceMarkedNotification(
          result.studentId._id,
          result.courseId._id,
          result.subjectId?._id,
          result.status,
          result.date,
          req.user.id
        );
      } catch (notificationError) {
        console.error('Failed to send attendance notification:', notificationError);
        // Don't fail the main operation if notification fails
      }
    }

    res.status(201).json({
      success: true,
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors
      },
      message: `Attendance marked: ${results.length} successful, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking attendance'
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin, Faculty)
export const updateAttendance = async (req, res) => {
  try {
    const { status, checkInTime, checkOutTime, notes, excuseReason } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    // Update fields
    if (status) {
      attendance.status = status;
      attendance.isExcused = status === 'excused';
    }
    if (checkInTime) {
      attendance.checkInTime = new Date(checkInTime);
      
      // Recalculate if late
      const classStartTime = new Date(attendance.date);
      classStartTime.setHours(9, 0, 0, 0);
      const checkIn = new Date(checkInTime);
      
      if (checkIn > classStartTime) {
        attendance.isLate = true;
        attendance.lateMinutes = Math.floor((checkIn - classStartTime) / (1000 * 60));
      } else {
        attendance.isLate = false;
        attendance.lateMinutes = 0;
      }
    }
    if (checkOutTime) {
      attendance.checkOutTime = new Date(checkOutTime);
      
      // Calculate duration
      if (attendance.checkInTime) {
        const duration = Math.floor((new Date(checkOutTime) - attendance.checkInTime) / (1000 * 60));
        attendance.duration = duration;
      }
    }
    if (notes !== undefined) attendance.notes = notes;
    if (excuseReason !== undefined) attendance.excuseReason = excuseReason;

    attendance.markedBy = req.user.id;
    attendance.markedAt = new Date();

    await attendance.save();

    // Populate the updated attendance
    await attendance.populate([
      { path: 'studentId', select: 'name email phone program' },
      { path: 'courseId', select: 'title courseCode department degree' },
      { path: 'subjectId', select: 'name code' },
      { path: 'markedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      data: attendance,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating attendance'
    });
  }
};

// @desc    Delete attendance record (soft delete)
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    attendance.isActive = false;
    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting attendance'
    });
  }
};

// @desc    Get attendance by course
// @route   GET /api/attendance/course/:courseId
// @access  Private
export const getAttendanceByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, subjectId, semester, year } = req.query;

    const filter = { courseId, isActive: true };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    if (subjectId) filter.subjectId = subjectId;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'name email phone program')
      .populate('subjectId', 'name code')
      .populate('markedBy', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance by course error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching course attendance'
    });
  }
};

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:studentId
// @access  Private
export const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, subjectId, startDate, endDate, semester, year } = req.query;

    const filter = { studentId, isActive: true };
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);
    if (startDate && endDate) {
      filter.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('courseId', 'title courseCode department degree')
      .populate('subjectId', 'name code')
      .populate('markedBy', 'name email')
      .sort({ date: -1 });

    // Calculate attendance statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const excusedDays = attendance.filter(a => a.status === 'excused').length;
    const leaveDays = attendance.filter(a => a.status === 'leave').length;

    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.json({
      success: true,
      data: {
        attendance,
        statistics: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          excusedDays,
          leaveDays,
          attendancePercentage
        }
      }
    });
  } catch (error) {
    console.error('Get attendance by student error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching student attendance'
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (Admin, Faculty)
export const getAttendanceStats = async (req, res) => {
  try {
    const { courseId, subjectId, startDate, endDate, semester, year } = req.query;

    const filter = { isActive: true };
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);
    if (startDate && endDate) {
      filter.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRecords = await Attendance.countDocuments(filter);
    const totalStudents = await Attendance.distinct('studentId', filter);
    const totalCourses = await Attendance.distinct('courseId', filter);

    const statusCounts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      leave: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    const attendancePercentage = totalRecords > 0 ? 
      Math.round((statusCounts.present / totalRecords) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalRecords,
        totalStudents: totalStudents.length,
        totalCourses: totalCourses.length,
        statusCounts,
        attendancePercentage
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching attendance statistics'
    });
  }
};

// @desc    Get students for attendance marking
// @route   GET /api/attendance/students/:courseId
// @access  Private (Admin, Faculty)
export const getStudentsForAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { subjectId, date } = req.query;

    // Get enrolled students
    const enrollments = await Enrollment.find({
      courseId,
      status: 'enrolled',
      isActive: true
    }).populate('studentId', 'name email phone program');

    const students = enrollments.map(enrollment => ({
      _id: enrollment.studentId._id,
      name: enrollment.studentId.name,
      email: enrollment.studentId.email,
      phone: enrollment.studentId.phone,
      program: enrollment.studentId.program,
      enrollmentDate: enrollment.enrollmentDate
    }));

    // Get existing attendance for the date (if provided)
    let existingAttendance = [];
    if (date) {
      const attendanceDate = new Date(date);
      existingAttendance = await Attendance.find({
        courseId,
        subjectId: subjectId || { $exists: true },
        date: attendanceDate,
        isActive: true
      }).populate('studentId', 'name email');
    }

    res.json({
      success: true,
      data: {
        students,
        existingAttendance
      }
    });
  } catch (error) {
    console.error('Get students for attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching students for attendance'
    });
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private (Admin, Faculty)
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { 
      courseId, 
      subjectId, 
      date, 
      semester, 
      year, 
      studentIds,
      status,
      notes 
    } = req.body;

    if (!courseId || !date || !semester || !year || !studentIds || !status) {
      return res.status(400).json({
        success: false,
        error: 'Course ID, date, semester, year, student IDs, and status are required'
      });
    }

    const attendanceDate = new Date(date);
    const results = [];
    const errors = [];

    for (const studentId of studentIds) {
      try {
        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          studentId,
          courseId,
          date: attendanceDate,
          isActive: true
        });

        if (existingAttendance) {
          // Update existing
          existingAttendance.status = status;
          existingAttendance.subjectId = subjectId;
          existingAttendance.markedBy = req.user.id;
          existingAttendance.markedAt = new Date();
          existingAttendance.notes = notes;
          await existingAttendance.save();
          results.push(existingAttendance);
        } else {
          // Create new
          const attendance = new Attendance({
            studentId,
            courseId,
            subjectId,
            date: attendanceDate,
            status,
            semester,
            year,
            markedBy: req.user.id,
            notes,
            isExcused: status === 'excused'
          });
          await attendance.save();
          results.push(attendance);
        }
      } catch (error) {
        errors.push({
          studentId,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors
      },
      message: `Bulk attendance marked: ${results.length} successful, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while bulk marking attendance'
    });
  }
};
