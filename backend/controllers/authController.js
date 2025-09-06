import User from "../models/User.js";
import { detectRoleFromEmail, isValidCollegeEmail, validateTestId, getApprovalAuthority } from "../utils/roleDetection.js";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password, testId, role: selectedRole, course } = req.body;

    // Validate email domain
    if (!isValidCollegeEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: "Please use a valid college email address" 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        error: "User already exists with this email" 
      });
    }

    // Auto-detect role from email
    const detectedRole = detectRoleFromEmail(email);

    // Use the selected role from form, or fall back to detected role
    const finalRole = selectedRole || detectedRole;

    // Test ID validation is no longer required
    // All users will be verified by admin

    // Determine approval authority
    const approvalAuthority = getApprovalAuthority(finalRole);

    // Create user with pending status
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      status: "pending",
      testId: testId || null,
      approvalAuthority,
      selectedRole: selectedRole || null,
      course: course || null
    });

    // All users require admin approval
    const approvalMessage = "Your account is awaiting approval from the Administrator. You will be notified once approved.";

    res.status(201).json({
      success: true,
      message: `Signup successful. ${approvalMessage}`,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        approvalAuthority: user.approvalAuthority
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    // Check if account is approved
    if (user.status !== "approved") {
      return res.status(403).json({ 
        success: false,
        error: "Your account is awaiting admin approval",
        status: user.status
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
