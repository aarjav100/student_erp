import CourseMaterial from '../models/CourseMaterial.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/materials'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents, videos, audio, and images are allowed.'), false);
    }
  }
});

// @desc    Get all course materials for a course
// @route   GET /api/lms/materials/:courseId
// @access  Private
export const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type, search, page = 1, limit = 10 } = req.query;
    
    // Check if user is enrolled in the course
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Build query
    const query = { courseId, isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const materials = await CourseMaterial.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CourseMaterial.countDocuments(query);

    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching course materials:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching course materials'
    });
  }
};

// @desc    Get single course material
// @route   GET /api/lms/materials/material/:id
// @access  Private
export const getCourseMaterial = async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('courseId', 'title courseCode');

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Course material not found'
      });
    }

    // Increment view count
    material.viewCount += 1;
    await material.save();

    // Update progress
    await updateMaterialProgress(req.user.id, material._id, material.courseId);

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error fetching course material:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching course material'
    });
  }
};

// @desc    Upload course material
// @route   POST /api/lms/materials/upload
// @access  Private (Teacher/Admin only)
export const uploadCourseMaterial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { courseId, title, description, type, tags } = req.body;
    const file = req.file;

    // Check if user has permission to upload materials
    const user = await User.findById(req.user.id);
    if (!['teacher', 'admin', 'faculty', 'professor'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to upload materials'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const materialData = {
      courseId,
      title,
      description,
      type,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: req.user.id,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileUrl: `/uploads/materials/${file.filename}`
    };

    const material = new CourseMaterial(materialData);
    await material.save();

    // Create notification for enrolled students
    await createMaterialNotification(courseId, material._id, title);

    res.status(201).json({
      success: true,
      data: material,
      message: 'Course material uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading course material:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while uploading course material'
    });
  }
};

// @desc    Update course material
// @route   PUT /api/lms/materials/:id
// @access  Private (Teacher/Admin only)
export const updateCourseMaterial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const material = await CourseMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Course material not found'
      });
    }

    // Check permissions
    if (material.uploadedBy.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this material'
      });
    }

    const { title, description, type, tags, isActive } = req.body;
    
    material.title = title || material.title;
    material.description = description || material.description;
    material.type = type || material.type;
    material.tags = tags ? tags.split(',').map(tag => tag.trim()) : material.tags;
    material.isActive = isActive !== undefined ? isActive : material.isActive;

    await material.save();

    res.json({
      success: true,
      data: material,
      message: 'Course material updated successfully'
    });
  } catch (error) {
    console.error('Error updating course material:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating course material'
    });
  }
};

// @desc    Delete course material
// @route   DELETE /api/lms/materials/:id
// @access  Private (Teacher/Admin only)
export const deleteCourseMaterial = async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Course material not found'
      });
    }

    // Check permissions
    if (material.uploadedBy.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this material'
      });
    }

    // Soft delete
    material.isActive = false;
    await material.save();

    res.json({
      success: true,
      message: 'Course material deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course material:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting course material'
    });
  }
};

// @desc    Download course material
// @route   GET /api/lms/materials/:id/download
// @access  Private
export const downloadCourseMaterial = async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Course material not found'
      });
    }

    // Increment download count
    material.downloadCount += 1;
    await material.save();

    // Update progress
    await updateMaterialProgress(req.user.id, material._id, material.courseId);

    const filePath = path.join(__dirname, '..', material.fileUrl);
    res.download(filePath, material.fileName);
  } catch (error) {
    console.error('Error downloading course material:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while downloading course material'
    });
  }
};

// Helper function to update material progress
const updateMaterialProgress = async (studentId, materialId, courseId) => {
  try {
    let progress = await Progress.findOne({ studentId, courseId });
    
    if (!progress) {
      progress = new Progress({ studentId, courseId, materialProgress: [] });
    }

    const materialProgress = progress.materialProgress.find(
      mp => mp.materialId.toString() === materialId.toString()
    );

    if (materialProgress) {
      materialProgress.progressPercentage = 100;
      materialProgress.status = 'completed';
      materialProgress.completedAt = new Date();
      materialProgress.lastAccessed = new Date();
    } else {
      progress.materialProgress.push({
        materialId,
        status: 'completed',
        progressPercentage: 100,
        completedAt: new Date(),
        lastAccessed: new Date()
      });
    }

    progress.lastActivity = new Date();
    await progress.save();
  } catch (error) {
    console.error('Error updating material progress:', error);
  }
};

// Helper function to create material notification
const createMaterialNotification = async (courseId, materialId, title) => {
  try {
    // Get all enrolled students
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const enrollments = await Enrollment.find({ courseId, status: 'enrolled' });
    
    const notifications = enrollments.map(enrollment => ({
      recipientId: enrollment.studentId,
      courseId,
      title: 'New Course Material Available',
      message: `New material "${title}" has been uploaded to your course.`,
      type: 'course-material',
      priority: 'medium',
      actionUrl: `/courses/${courseId}/materials/${materialId}`,
      actionText: 'View Material',
      metadata: { materialId }
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating material notification:', error);
  }
};

export { upload };
