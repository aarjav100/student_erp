import express from 'express';
import { body, validationResult } from 'express-validator';
import Fee from '../models/Fee.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's fees
// @route   GET /api/fees/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.user.id })
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    console.error('Get my fees error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching fees',
    });
  }
});

// @desc    Get all fees (admin only)
// @route   GET /api/fees
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { studentId, status, type } = req.query;
    const query = {};

    if (studentId) query.studentId = studentId;
    if (status) query.status = status;
    if (type) query.type = type;

    const fees = await Fee.find(query)
      .populate('studentId', 'name email studentId')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching fees',
    });
  }
});

// @desc    Create fee (admin only)
// @route   POST /api/fees
// @access  Private/Admin
router.post('/', [
  protect,
  adminOnly,
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('type').isIn(['tuition', 'library', 'lab', 'exam', 'other']).withMessage('Invalid fee type'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('description').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array(),
      });
    }

    const fee = new Fee({
      ...req.body,
      createdBy: req.user.id,
    });

    await fee.save();

    // Populate the response
    await fee.populate('studentId', 'name email studentId');

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: fee,
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating fee',
    });
  }
});

// @desc    Update fee (admin only)
// @route   PUT /api/fees/:id
// @access  Private/Admin
router.put('/:id', [
  protect,
  adminOnly,
  body('type').optional().isIn(['tuition', 'library', 'lab', 'exam', 'other']).withMessage('Invalid fee type'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('status').optional().isIn(['pending', 'paid', 'overdue', 'waived']).withMessage('Invalid status'),
  body('description').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array(),
      });
    }

    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('studentId', 'name email studentId');

    if (!fee) {
      return res.status(404).json({
        success: false,
        error: 'Fee not found',
      });
    }

    res.json({
      success: true,
      message: 'Fee updated successfully',
      data: fee,
    });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating fee',
    });
  }
});

// @desc    Mark fee as paid
// @route   PATCH /api/fees/:id/pay
// @access  Private
router.patch('/:id/pay', [
  protect,
  body('paymentMethod').optional().trim(),
  body('transactionId').optional().trim(),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const fee = await Fee.findOne({ _id: req.params.id, studentId: req.user.id });

    if (!fee) {
      return res.status(404).json({
        success: false,
        error: 'Fee not found or you do not have permission to pay it',
      });
    }

    fee.status = 'paid';
    fee.paidAt = new Date();
    fee.paymentMethod = req.body.paymentMethod;
    fee.transactionId = req.body.transactionId;
    fee.notes = req.body.notes;
    fee.updatedAt = new Date();

    await fee.save();

    res.json({
      success: true,
      message: 'Fee marked as paid successfully',
      data: fee,
    });
  } catch (error) {
    console.error('Pay fee error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing payment',
    });
  }
});

// @desc    Delete fee (admin only)
// @route   DELETE /api/fees/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        error: 'Fee not found',
      });
    }

    res.json({
      success: true,
      message: 'Fee deleted successfully',
    });
  } catch (error) {
    console.error('Delete fee error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting fee',
    });
  }
});

export default router;