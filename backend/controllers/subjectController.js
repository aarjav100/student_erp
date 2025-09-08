import Subject from '../models/Subject.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private (Admin/Faculty)
export const getSubjects = async (req, res) => {
  try {
    const { courseId, semester, year, instructor, status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    if (courseId) query.courseId = courseId;
    if (semester) query.semester = parseInt(semester);
    if (year) query.year = parseInt(year);
    if (instructor) query.instructor = instructor;
    if (status) query.status = status;

    const subjects = await Subject.find(query)
      .populate('courseId', 'title courseCode department degree')
      .populate('instructor', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email')
      .sort({ courseId: 1, semester: 1, year: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subject.countDocuments(query);

    res.json({
      success: true,
      data: {
        subjects,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching subjects'
    });
  }
};

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Private
export const getSubject = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subject ID format'
      });
    }

    const subject = await Subject.findById(req.params.id)
      .populate('courseId', 'title courseCode department degree')
      .populate('instructor', 'name email phone')
      .populate('prerequisites', 'name code credits')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching subject'
    });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin/Faculty)
export const createSubject = async (req, res) => {
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
      name, code, description, courseId, credits, semester, year,
      instructor, prerequisites, objectives, outcomes, syllabus,
      textbooks, references, assessment, schedule, isElective,
      maxStudents, minStudents
    } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        error: 'Subject code already exists'
      });
    }

    // Validate instructor if provided
    if (instructor) {
      const instructorUser = await User.findById(instructor);
      if (!instructorUser || !['faculty', 'professor', 'teacher'].includes(instructorUser.role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid instructor'
        });
      }
    }

    // Validate prerequisites if provided
    if (prerequisites && prerequisites.length > 0) {
      const validPrerequisites = await Subject.find({ _id: { $in: prerequisites } });
      if (validPrerequisites.length !== prerequisites.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more prerequisites are invalid'
        });
      }
    }

    const subjectData = {
      name,
      code,
      description,
      courseId,
      credits,
      semester,
      year,
      instructor,
      prerequisites,
      objectives,
      outcomes,
      syllabus,
      textbooks,
      references,
      assessment,
      schedule,
      isElective,
      maxStudents,
      minStudents,
      createdBy: req.user.id
    };

    const subject = new Subject(subjectData);
    await subject.save();

    // Populate the response
    await subject.populate('courseId', 'title courseCode department degree');
    await subject.populate('instructor', 'name email');
    await subject.populate('prerequisites', 'name code');

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully'
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating subject'
    });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin/Faculty)
export const updateSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    // Check permissions - only admin or the instructor can update
    if (req.user.role !== 'admin' && 
        subject.instructor && 
        subject.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this subject'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    // Validate instructor if being updated
    if (updateData.instructor) {
      const instructorUser = await User.findById(updateData.instructor);
      if (!instructorUser || !['faculty', 'professor', 'teacher'].includes(instructorUser.role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid instructor'
        });
      }
    }

    // Validate prerequisites if being updated
    if (updateData.prerequisites && updateData.prerequisites.length > 0) {
      const validPrerequisites = await Subject.find({ _id: { $in: updateData.prerequisites } });
      if (validPrerequisites.length !== updateData.prerequisites.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more prerequisites are invalid'
        });
      }
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('courseId', 'title courseCode department degree')
      .populate('instructor', 'name email')
      .populate('prerequisites', 'name code');

    res.json({
      success: true,
      data: updatedSubject,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating subject'
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    // Only admin can delete subjects
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can delete subjects'
      });
    }

    // Soft delete - mark as archived
    subject.status = 'archived';
    subject.updatedBy = req.user.id;
    await subject.save();

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting subject'
    });
  }
};

// @desc    Get subjects by course
// @route   GET /api/subjects/course/:courseId
// @access  Private
export const getSubjectsByCourse = async (req, res) => {
  try {
    const { semester, year } = req.query;
    
    const query = { courseId: req.params.courseId, status: 'active' };
    
    if (semester) query.semester = parseInt(semester);
    if (year) query.year = parseInt(year);

    const subjects = await Subject.find(query)
      .populate('instructor', 'name email')
      .populate('prerequisites', 'name code')
      .sort({ semester: 1, year: 1, name: 1 });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects by course:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching subjects'
    });
  }
};

// @desc    Get subjects by instructor
// @route   GET /api/subjects/instructor/:instructorId
// @access  Private
export const getSubjectsByInstructor = async (req, res) => {
  try {
    const subjects = await Subject.find({ 
      instructor: req.params.instructorId,
      status: 'active'
    })
      .populate('courseId', 'title courseCode department degree')
      .populate('prerequisites', 'name code')
      .sort({ courseId: 1, semester: 1, year: 1 });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects by instructor:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching subjects'
    });
  }
};

// @desc    Get subject statistics
// @route   GET /api/subjects/stats
// @access  Private (Admin/Faculty)
export const getSubjectStats = async (req, res) => {
  try {
    const stats = await Subject.aggregate([
      {
        $group: {
          _id: null,
          totalSubjects: { $sum: 1 },
          activeSubjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          electiveSubjects: {
            $sum: { $cond: [{ $eq: ['$isElective', true] }, 1, 0] }
          },
          averageCredits: { $avg: '$credits' }
        }
      }
    ]);

    const courseStats = await Subject.aggregate([
      {
        $group: {
          _id: '$courseId',
          subjectCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          courseName: '$course.title',
          courseCode: '$course.courseCode',
          subjectCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalSubjects: 0,
          activeSubjects: 0,
          electiveSubjects: 0,
          averageCredits: 0
        },
        byCourse: courseStats
      }
    });
  } catch (error) {
    console.error('Error fetching subject stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching statistics'
    });
  }
};
