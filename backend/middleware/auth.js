import jwt from "jsonwebtoken";
import User from "../models/User.js";

// @desc    Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Not authorized, user not found"
        });
      }

      // Check if user is approved
      if (req.user.status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: "Account not approved"
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Not authorized, token failed"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token"
    });
  }
};

// @desc    Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// @desc    Admin only access
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required."
    });
  }
  next();
};

// @desc    Teacher or Admin access
export const teacherOrAdmin = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Teacher or Admin privileges required."
    });
  }
  next();
};

// @desc    Protect routes for approval system - allows admin/teacher even if not approved
export const protectApproval = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Not authorized, user not found"
        });
      }

      // For approval system, allow admin/teacher access even if not approved
      if (['admin', 'teacher'].includes(req.user.role)) {
        next();
        return;
      }

      // For other roles, check if approved
      if (req.user.status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: "Account not approved"
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Not authorized, token failed"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token"
    });
  }
};