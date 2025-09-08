import User from "../models/User.js";

// @desc    Get all pending users
// @route   GET /api/admin/pending-users
// @access  Private (Admin only)
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, role } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total
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

// @desc    Approve user
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin only)
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.status === "approved") {
      return res.status(400).json({
        success: false,
        error: "User is already approved"
      });
    }

    user.status = "approved";
    // Track who approved and when
    if (req.user?._id) {
      user.approvedBy = req.user._id;
    }
    user.approvedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "User approved successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        approvedAt: user.approvedAt,
        approvedBy: user.approvedBy
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reject user
// @route   PUT /api/admin/users/:id/reject
// @access  Private (Admin only)
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.status === "rejected") {
      return res.status(400).json({
        success: false,
        error: "User is already rejected"
      });
    }

    user.status = "rejected";
    await user.save();

    res.json({
      success: true,
      message: "User rejected successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ status: "pending" });
    const approvedUsers = await User.countDocuments({ status: "approved" });
    const rejectedUsers = await User.countDocuments({ status: "rejected" });
    
    const students = await User.countDocuments({ role: "student", status: "approved" });
    const teachers = await User.countDocuments({ role: "teacher", status: "approved" });
    const admins = await User.countDocuments({ role: "admin", status: "approved" });

    res.json({
      success: true,
      data: {
        totalUsers,
        pendingUsers,
        approvedUsers,
        rejectedUsers,
        byRole: {
          students,
          teachers,
          admins
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

// @desc    Update a user's details (name, email, role, studentId)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'role', 'studentId'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
