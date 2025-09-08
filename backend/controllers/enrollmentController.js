import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private (Admin, Faculty)
export const getEnrollments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      courseId, 
      studentId, 
      semester, 
      year,
      sortBy = 'enrollmentDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (status) filter.status = status;
    if (courseId) filter.courseId = courseId;
    if (studentId) filter.studentId = studentId;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'name email phone program')
      .populate('courseId', 'title courseCode department degree')
      .populate('enrolledBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Enrollment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching enrollments'
    });
  }
};

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private
export const getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('studentId', 'name email phone program')
      .populate('courseId', 'title courseCode department degree')
      .populate('enrolledBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching enrollment'
    });
  }
};

// @desc    Create new enrollment
// @route   POST /api/enrollments
// @access  Private (Faculty, Admin)
export const createEnrollment = async (req, res) => {
  try {
    const { studentId, courseId, semester, year, notes } = req.body;

    // Validate required fields
    if (!studentId || !courseId || !semester || !year) {
      return res.status(400).json({
        success: false,
        error: 'Student ID, Course ID, semester, and year are required'
      });
    }

    // Check if student exists and is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID or user is not a student'
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

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId,
      isActive: true
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Student is already enrolled in this course'
      });
    }

    // Check course capacity
    const currentEnrollments = await Enrollment.countDocuments({
      courseId,
      status: { $in: ['enrolled', 'pending'] },
      isActive: true
    });

    if (currentEnrollments >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        error: 'Course is at maximum capacity'
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      studentId,
      courseId,
      semester,
      year,
      enrolledBy: req.user.id,
      notes,
      status: req.user.role === 'admin' ? 'enrolled' : 'pending'
    });

    if (req.user.role === 'admin') {
      enrollment.approvedBy = req.user.id;
      enrollment.approvalDate = new Date();
    }

    await enrollment.save();

    // Populate the created enrollment
    await enrollment.populate([
      { path: 'studentId', select: 'name email phone program' },
      { path: 'courseId', select: 'title courseCode department degree' },
      { path: 'enrolledBy', select: 'name email' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Enrollment created successfully'
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating enrollment'
    });
  }
};

// @desc    Update enrollment
// @route   PUT /api/enrollments/:id
// @access  Private (Admin, Faculty)
export const updateEnrollment = async (req, res) => {
  try {
    const { status, grade, notes, dropReason } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    // Update fields
    if (status) {
      enrollment.status = status;
      if (status === 'enrolled' && !enrollment.approvedBy) {
        enrollment.approvedBy = req.user.id;
        enrollment.approvalDate = new Date();
      }
      if (status === 'dropped') {
        enrollment.dropDate = new Date();
        if (dropReason) enrollment.dropReason = dropReason;
      }
    }
    if (grade !== undefined) enrollment.grade = grade;
    if (notes !== undefined) enrollment.notes = notes;

    await enrollment.save();

    // Populate the updated enrollment
    await enrollment.populate([
      { path: 'studentId', select: 'name email phone program' },
      { path: 'courseId', select: 'title courseCode department degree' },
      { path: 'enrolledBy', select: 'name email' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      data: enrollment,
      message: 'Enrollment updated successfully'
    });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating enrollment'
    });
  }
};

// @desc    Delete enrollment (soft delete)
// @route   DELETE /api/enrollments/:id
// @access  Private (Admin)
export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    enrollment.isActive = false;
    await enrollment.save();

    res.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting enrollment'
    });
  }
};

// @desc    Get enrollments by course
// @route   GET /api/enrollments/course/:courseId
// @access  Private
export const getEnrollmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, semester, year } = req.query;

    const filter = { courseId, isActive: true };
    if (status) filter.status = status;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);

    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'name email phone program')
      .populate('enrolledBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get enrollments by course error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching course enrollments'
    });
  }
};

// @desc    Get enrollments by student
// @route   GET /api/enrollments/student/:studentId
// @access  Private
export const getEnrollmentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, semester, year } = req.query;

    const filter = { studentId, isActive: true };
    if (status) filter.status = status;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);

    const enrollments = await Enrollment.find(filter)
      .populate('courseId', 'title courseCode department degree')
      .populate('enrolledBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get enrollments by student error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching student enrollments'
    });
  }
};

// @desc    Get enrollment statistics
// @route   GET /api/enrollments/stats
// @access  Private (Admin, Faculty)
export const getEnrollmentStats = async (req, res) => {
  try {
    const { semester, year } = req.query;

    const filter = { isActive: true };
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);

    const stats = await Enrollment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEnrollments = await Enrollment.countDocuments(filter);
    const totalStudents = await Enrollment.distinct('studentId', filter);
    const totalCourses = await Enrollment.distinct('courseId', filter);

    const statusCounts = {
      pending: 0,
      enrolled: 0,
      dropped: 0,
      completed: 0,
      suspended: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        totalEnrollments,
        totalStudents: totalStudents.length,
        totalCourses: totalCourses.length,
        statusCounts
      }
    });
  } catch (error) {
    console.error('Get enrollment stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching enrollment statistics'
    });
  }
};

// @desc    Bulk enroll students
// @route   POST /api/enrollments/bulk
// @access  Private (Admin, Faculty)
export const bulkEnrollStudents = async (req, res) => {
  try {
    const { enrollments } = req.body;

    if (!Array.isArray(enrollments) || enrollments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Enrollments array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const enrollmentData of enrollments) {
      try {
        const { studentId, courseId, semester, year, notes } = enrollmentData;

        // Validate required fields
        if (!studentId || !courseId || !semester || !year) {
          errors.push({
            studentId,
            courseId,
            error: 'Missing required fields'
          });
          continue;
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
          studentId,
          courseId,
          isActive: true
        });

        if (existingEnrollment) {
          errors.push({
            studentId,
            courseId,
            error: 'Student already enrolled'
          });
          continue;
        }

        // Create enrollment
        const enrollment = new Enrollment({
          studentId,
          courseId,
          semester,
          year,
          enrolledBy: req.user.id,
          notes,
          status: req.user.role === 'admin' ? 'enrolled' : 'pending'
        });

        if (req.user.role === 'admin') {
          enrollment.approvedBy = req.user.id;
          enrollment.approvalDate = new Date();
        }

        await enrollment.save();
        results.push(enrollment);
      } catch (error) {
        errors.push({
          studentId: enrollmentData.studentId,
          courseId: enrollmentData.courseId,
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
      message: `Bulk enrollment completed: ${results.length} successful, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Bulk enroll students error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while bulk enrolling students'
    });
  }
};
