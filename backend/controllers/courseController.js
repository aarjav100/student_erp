import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req, res) => {
  try {
    const { department, degree, status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (department) query.department = department;
    if (degree) query.degree = degree;
    if (status) query.status = status;

    const courses = await Course.find(query)
      .populate('hod', 'name email')
      .populate('coordinator', 'name email')
      .populate('createdBy', 'name email')
      .sort({ courseCode: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching courses'
    });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
export const getCourse = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid course ID format'
      });
    }

    const course = await Course.findById(req.params.id)
      .populate('hod', 'name email phone')
      .populate('coordinator', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get subjects for this course
    const subjects = await Subject.find({ 
      courseId: req.params.id, 
      status: 'active' 
    })
      .populate('instructor', 'name email')
      .sort({ semester: 1, year: 1 });

    res.json({
      success: true,
      data: {
        course,
        subjects
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching course'
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin/Faculty)
export const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      courseCode, title, description, department, degree, duration,
      totalCredits, semesterCredits, maxStudents, hod, coordinator,
      objectives, outcomes, eligibility, admissionProcess, feeStructure
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: 'Course code already exists'
      });
    }

    // Validate HOD if provided
    if (hod) {
      const hodUser = await User.findById(hod);
      if (!hodUser || !['dean', 'admin'].includes(hodUser.role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid HOD'
        });
      }
    }

    // Validate coordinator if provided
    if (coordinator) {
      const coordinatorUser = await User.findById(coordinator);
      if (!coordinatorUser || !['faculty', 'professor', 'teacher'].includes(coordinatorUser.role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid coordinator'
        });
      }
    }

    const courseData = {
      courseCode,
      title,
      description,
      department,
      degree,
      duration,
      totalCredits,
      semesterCredits,
      maxStudents,
      hod,
      coordinator,
      objectives,
      outcomes,
      eligibility,
      admissionProcess,
      feeStructure,
      createdBy: req.user.id
    };

    const course = new Course(courseData);
    await course.save();

    // Populate the response
    await course.populate('hod', 'name email');
    await course.populate('coordinator', 'name email');
    await course.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating course'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Faculty)
export const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check permissions - only admin or HOD can update
    if (req.user.role !== 'admin' && 
        course.hod && 
        course.hod.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this course'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    // Validate HOD if being updated
    if (updateData.hod) {
      const hodUser = await User.findById(updateData.hod);
      if (!hodUser || !['dean', 'admin'].includes(hodUser.role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid HOD'
        });
      }
    }

    // Validate coordinator if being updated
    if (updateData.coordinator) {
      const coordinatorUser = await User.findById(updateData.coordinator);
      if (!coordinatorUser || !['faculty', 'professor', 'teacher'].includes(coordinatorUser.role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid coordinator'
        });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('hod', 'name email')
      .populate('coordinator', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      data: updatedCourse,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating course'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Only admin can delete courses
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can delete courses'
      });
    }

    // Check if course has subjects
    const subjectCount = await Subject.countDocuments({ courseId: req.params.id });
    if (subjectCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete course with existing subjects. Please archive subjects first.'
      });
    }

    // Soft delete - mark as archived
    course.status = 'archived';
    course.isActive = false;
    course.updatedBy = req.user.id;
    await course.save();

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting course'
    });
  }
};

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private (Admin/Faculty)
export const getCourseStats = async (req, res) => {
  try {
    const stats = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          activeCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalEnrollment: { $sum: '$currentEnrollment' },
          totalCapacity: { $sum: '$maxStudents' },
          averageCredits: { $avg: '$totalCredits' }
        }
      }
    ]);

    const departmentStats = await Course.aggregate([
      {
        $group: {
          _id: '$department',
          courseCount: { $sum: 1 },
          totalEnrollment: { $sum: '$currentEnrollment' },
          totalCapacity: { $sum: '$maxStudents' }
        }
      },
      {
        $sort: { courseCount: -1 }
      }
    ]);

    const degreeStats = await Course.aggregate([
      {
        $group: {
          _id: '$degree',
          courseCount: { $sum: 1 },
          totalEnrollment: { $sum: '$currentEnrollment' },
          totalCapacity: { $sum: '$maxStudents' }
        }
      },
      {
        $sort: { courseCount: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalCourses: 0,
          activeCourses: 0,
          totalEnrollment: 0,
          totalCapacity: 0,
          averageCredits: 0
        },
        byDepartment: departmentStats,
        byDegree: degreeStats
      }
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching statistics'
    });
  }
};

// @desc    Get courses by department
// @route   GET /api/courses/department/:department
// @access  Private
export const getCoursesByDepartment = async (req, res) => {
  try {
    const courses = await Course.find({ 
      department: req.params.department.toUpperCase(),
      status: 'active',
      isActive: true
    })
      .populate('hod', 'name email')
      .populate('coordinator', 'name email')
      .sort({ courseCode: 1 });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses by department:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching courses'
    });
  }
};
