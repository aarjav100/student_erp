import User from "../models/User.js";

// @desc    Get pending approvals for registration block
// @route   GET /api/approvals/registration-block
// @access  Private (Admin only)
export const getRegistrationBlockApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      approvalAuthority: 'registration_block',
      status: 'pending'
    }).select('-password');

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

// @desc    Get pending approvals for faculty
// @route   GET /api/approvals/faculty
// @access  Private (Faculty/Admin only)
export const getFacultyApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      approvalAuthority: 'faculty',
      status: 'pending'
    }).select('-password');

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

// @desc    Approve user
// @route   PUT /api/approvals/:userId/approve
// @access  Private (Admin/Faculty only)
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approvedBy } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: "User is not pending approval"
      });
    }

    user.status = 'approved';
    user.approvedBy = approvedBy;
    user.approvedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: "User approved successfully",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        approvedAt: user.approvedAt
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
// @route   PUT /api/approvals/:userId/reject
// @access  Private (Admin/Faculty only)
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rejectionReason, rejectedBy } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: "User is not pending approval"
      });
    }

    user.status = 'rejected';
    user.rejectionReason = rejectionReason;
    user.approvedBy = rejectedBy;
    user.approvedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: "User rejected successfully",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        rejectionReason: user.rejectionReason,
        rejectedAt: user.approvedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user approval status
// @route   GET /api/approvals/status/:email
// @access  Public
export const getApprovalStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        approvalAuthority: user.approvalAuthority,
        approvedAt: user.approvedAt,
        rejectionReason: user.rejectionReason
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
