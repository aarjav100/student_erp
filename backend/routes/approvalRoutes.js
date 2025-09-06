import express from 'express';
import { 
  getRegistrationBlockApprovals, 
  getFacultyApprovals, 
  approveUser, 
  rejectUser, 
  getApprovalStatus 
} from '../controllers/approvalController.js';
import { protect, protectApproval, teacherOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/status/:email', getApprovalStatus);

// Protected routes - use protectApproval to allow admin/teacher access even if not approved
router.get('/registration-block', protectApproval, teacherOrAdmin, getRegistrationBlockApprovals);
router.get('/faculty', protectApproval, teacherOrAdmin, getFacultyApprovals);
router.put('/:userId/approve', protectApproval, teacherOrAdmin, approveUser);
router.put('/:userId/reject', protectApproval, teacherOrAdmin, rejectUser);

export default router;
