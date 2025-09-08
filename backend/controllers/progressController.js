import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import CourseMaterial from '../models/CourseMaterial.js';
import Assignment from '../models/Assignment.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';

// @desc    Get student progress for a course
// @route   GET /api/lms/progress/:courseId
// @access  Private
export const getStudentProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    let progress = await Progress.findOne({ studentId, courseId })
      .populate('materialProgress.materialId', 'title type')
      .populate('assignmentProgress.assignmentId', 'title type dueDate')
      .populate('quizProgress.quizId', 'title startDate endDate');

    if (!progress) {
      // Create initial progress record
      progress = new Progress({ studentId, courseId });
      await progress.save();
    }

    // Get course information
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get total counts for progress calculation
    const totalMaterials = await CourseMaterial.countDocuments({ courseId, isActive: true });
    const totalAssignments = await Assignment.countDocuments({ courseId, isActive: true, isPublished: true });
    const totalQuizzes = await Quiz.countDocuments({ courseId, isActive: true });

    // Calculate detailed progress
    const materialProgress = {
      total: totalMaterials,
      completed: progress.materialProgress.filter(mp => mp.status === 'completed').length,
      inProgress: progress.materialProgress.filter(mp => mp.status === 'in-progress').length,
      notStarted: totalMaterials - progress.materialProgress.length
    };

    const assignmentProgress = {
      total: totalAssignments,
      submitted: progress.assignmentProgress.filter(ap => ap.status === 'submitted' || ap.status === 'graded').length,
      graded: progress.assignmentProgress.filter(ap => ap.status === 'graded').length,
      notStarted: totalAssignments - progress.assignmentProgress.length
    };

    const quizProgress = {
      total: totalQuizzes,
      completed: progress.quizProgress.filter(qp => qp.status === 'completed').length,
      attempted: progress.quizProgress.filter(qp => qp.attempts > 0).length,
      notStarted: totalQuizzes - progress.quizProgress.length
    };

    res.json({
      success: true,
      data: {
        progress,
        course: {
          id: course._id,
          title: course.title,
          courseCode: course.courseCode
        },
        summary: {
          overallProgress: progress.overallProgress,
          totalTimeSpent: progress.totalTimeSpent,
          lastActivity: progress.lastActivity,
          streak: progress.streak,
          badges: progress.badges,
          achievements: progress.achievements
        },
        details: {
          materials: materialProgress,
          assignments: assignmentProgress,
          quizzes: quizProgress
        }
      }
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching student progress'
    });
  }
};

// @desc    Get all student progress for a course (Teacher/Admin only)
// @route   GET /api/lms/progress/:courseId/all
// @access  Private (Teacher/Admin only)
export const getAllStudentProgress = async (req, res) => {
  try {
    // Check if user has permission
    const user = await User.findById(req.user.id);
    if (!['teacher', 'admin', 'faculty', 'professor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view all student progress'
      });
    }

    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Get all progress records for the course
    const progressRecords = await Progress.find({ courseId })
      .populate('studentId', 'name email studentId')
      .populate('materialProgress.materialId', 'title type')
      .populate('assignmentProgress.assignmentId', 'title type dueDate')
      .populate('quizProgress.quizId', 'title startDate endDate')
      .sort({ overallProgress: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Progress.countDocuments({ courseId });

    // Get course information
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: {
        progressRecords,
        course: {
          id: course._id,
          title: course.title,
          courseCode: course.courseCode
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all student progress:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching student progress'
    });
  }
};

// @desc    Update material progress
// @route   PUT /api/lms/progress/:courseId/material/:materialId
// @access  Private
export const updateMaterialProgress = async (req, res) => {
  try {
    const { courseId, materialId } = req.params;
    const { progressPercentage, timeSpent } = req.body;
    const studentId = req.user.id;

    // Verify material exists
    const material = await CourseMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Course material not found'
      });
    }

    let progress = await Progress.findOne({ studentId, courseId });
    if (!progress) {
      progress = new Progress({ studentId, courseId, materialProgress: [] });
    }

    const materialProgressIndex = progress.materialProgress.findIndex(
      mp => mp.materialId.toString() === materialId
    );

    const progressData = {
      materialId,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage || 0)),
      timeSpent: timeSpent || 0,
      lastAccessed: new Date()
    };

    if (progressData.progressPercentage >= 100) {
      progressData.status = 'completed';
      progressData.completedAt = new Date();
    } else if (progressData.progressPercentage > 0) {
      progressData.status = 'in-progress';
    } else {
      progressData.status = 'not-started';
    }

    if (materialProgressIndex >= 0) {
      progress.materialProgress[materialProgressIndex] = {
        ...progress.materialProgress[materialProgressIndex].toObject(),
        ...progressData
      };
    } else {
      progress.materialProgress.push(progressData);
    }

    progress.lastActivity = new Date();
    await progress.save();

    res.json({
      success: true,
      data: progress.materialProgress[materialProgressIndex >= 0 ? materialProgressIndex : progress.materialProgress.length - 1],
      message: 'Material progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating material progress:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating material progress'
    });
  }
};

// @desc    Update assignment progress
// @route   PUT /api/lms/progress/:courseId/assignment/:assignmentId
// @access  Private
export const updateAssignmentProgress = async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    const { status, grade, score, maxScore, feedback } = req.body;
    const studentId = req.user.id;

    // Verify assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    let progress = await Progress.findOne({ studentId, courseId });
    if (!progress) {
      progress = new Progress({ studentId, courseId, assignmentProgress: [] });
    }

    const assignmentProgressIndex = progress.assignmentProgress.findIndex(
      ap => ap.assignmentId.toString() === assignmentId
    );

    const progressData = {
      assignmentId,
      status: status || 'not-started',
      grade,
      score,
      maxScore,
      feedback
    };

    if (status === 'submitted') {
      progressData.submittedAt = new Date();
    }

    if (assignmentProgressIndex >= 0) {
      progress.assignmentProgress[assignmentProgressIndex] = {
        ...progress.assignmentProgress[assignmentProgressIndex].toObject(),
        ...progressData
      };
    } else {
      progress.assignmentProgress.push(progressData);
    }

    progress.lastActivity = new Date();
    await progress.save();

    res.json({
      success: true,
      data: progress.assignmentProgress[assignmentProgressIndex >= 0 ? assignmentProgressIndex : progress.assignmentProgress.length - 1],
      message: 'Assignment progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating assignment progress:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating assignment progress'
    });
  }
};

// @desc    Update quiz progress
// @route   PUT /api/lms/progress/:courseId/quiz/:quizId
// @access  Private
export const updateQuizProgress = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const { attempts, bestScore, bestPercentage, status } = req.body;
    const studentId = req.user.id;

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    let progress = await Progress.findOne({ studentId, courseId });
    if (!progress) {
      progress = new Progress({ studentId, courseId, quizProgress: [] });
    }

    const quizProgressIndex = progress.quizProgress.findIndex(
      qp => qp.quizId.toString() === quizId
    );

    const progressData = {
      quizId,
      attempts: attempts || 0,
      bestScore: bestScore || 0,
      bestPercentage: bestPercentage || 0,
      status: status || 'not-started',
      lastAttempt: new Date()
    };

    if (quizProgressIndex >= 0) {
      progress.quizProgress[quizProgressIndex] = {
        ...progress.quizProgress[quizProgressIndex].toObject(),
        ...progressData
      };
    } else {
      progress.quizProgress.push(progressData);
    }

    progress.lastActivity = new Date();
    await progress.save();

    res.json({
      success: true,
      data: progress.quizProgress[quizProgressIndex >= 0 ? quizProgressIndex : progress.quizProgress.length - 1],
      message: 'Quiz progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating quiz progress:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating quiz progress'
    });
  }
};

// @desc    Get student dashboard data
// @route   GET /api/lms/progress/dashboard
// @access  Private
export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all progress records for the student
    const progressRecords = await Progress.find({ studentId })
      .populate('courseId', 'title courseCode')
      .sort({ lastActivity: -1 });

    // Get recent activities
    const recentActivities = await getRecentActivities(studentId);

    // Get upcoming deadlines
    const upcomingDeadlines = await getUpcomingDeadlines(studentId);

    // Get achievements and badges
    const achievements = progressRecords.reduce((acc, progress) => {
      acc.push(...progress.achievements);
      acc.push(...progress.badges);
      return acc;
    }, []);

    // Calculate overall statistics
    const totalCourses = progressRecords.length;
    const averageProgress = progressRecords.reduce((sum, progress) => sum + progress.overallProgress, 0) / totalCourses || 0;
    const totalTimeSpent = progressRecords.reduce((sum, progress) => sum + progress.totalTimeSpent, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalCourses,
          averageProgress: Math.round(averageProgress),
          totalTimeSpent,
          achievements: achievements.length
        },
        courses: progressRecords,
        recentActivities,
        upcomingDeadlines,
        achievements: achievements.slice(0, 10) // Latest 10 achievements
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching student dashboard'
    });
  }
};

// Helper function to get recent activities
const getRecentActivities = async (studentId) => {
  try {
    const activities = [];

    // Get recent material views
    const recentMaterials = await Progress.findOne({ studentId })
      .populate('materialProgress.materialId', 'title type')
      .populate('courseId', 'title courseCode');
    
    if (recentMaterials) {
      const recentMaterialViews = recentMaterials.materialProgress
        .filter(mp => mp.lastAccessed)
        .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
        .slice(0, 5)
        .map(mp => ({
          type: 'material',
          title: mp.materialId.title,
          course: recentMaterials.courseId.title,
          date: mp.lastAccessed,
          status: mp.status
        }));
      activities.push(...recentMaterialViews);
    }

    // Get recent quiz attempts
    const recentQuizAttempts = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title')
      .populate('courseId', 'title courseCode')
      .sort({ timeCompleted: -1 })
      .limit(5);

    const quizActivities = recentQuizAttempts.map(attempt => ({
      type: 'quiz',
      title: attempt.quizId.title,
      course: attempt.courseId.title,
      date: attempt.timeCompleted,
      score: attempt.totalScore,
      maxScore: attempt.maxScore
    }));
    activities.push(...quizActivities);

    // Get recent assignment submissions
    const recentSubmissions = await AssignmentSubmission.find({ studentId })
      .populate('assignmentId', 'title')
      .populate('courseId', 'title courseCode')
      .sort({ submittedAt: -1 })
      .limit(5);

    const submissionActivities = recentSubmissions.map(submission => ({
      type: 'assignment',
      title: submission.assignmentId.title,
      course: submission.courseId.title,
      date: submission.submittedAt,
      status: submission.status
    }));
    activities.push(...submissionActivities);

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return [];
  }
};

// Helper function to get upcoming deadlines
const getUpcomingDeadlines = async (studentId) => {
  try {
    const deadlines = [];

    // Get upcoming assignment deadlines
    const upcomingAssignments = await Assignment.find({
      dueDate: { $gte: new Date() },
      isActive: true,
      isPublished: true
    })
      .populate('courseId', 'title courseCode')
      .sort({ dueDate: 1 })
      .limit(10);

    const assignmentDeadlines = upcomingAssignments.map(assignment => ({
      type: 'assignment',
      title: assignment.title,
      course: assignment.courseId.title,
      dueDate: assignment.dueDate,
      points: assignment.points
    }));
    deadlines.push(...assignmentDeadlines);

    // Get upcoming quiz deadlines
    const upcomingQuizzes = await Quiz.find({
      endDate: { $gte: new Date() },
      isActive: true
    })
      .populate('courseId', 'title courseCode')
      .sort({ endDate: 1 })
      .limit(10);

    const quizDeadlines = upcomingQuizzes.map(quiz => ({
      type: 'quiz',
      title: quiz.title,
      course: quiz.courseId.title,
      dueDate: quiz.endDate,
      timeLimit: quiz.timeLimit
    }));
    deadlines.push(...quizDeadlines);

    return deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 10);
  } catch (error) {
    console.error('Error getting upcoming deadlines:', error);
    return [];
  }
};
