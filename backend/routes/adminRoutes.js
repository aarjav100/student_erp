import express from 'express';
import { 
  getPendingUsers, 
  getAllUsers, 
  approveUser, 
  rejectUser, 
  getUserStats 
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes are protected and admin-only
router.use(protect);
router.use(adminOnly);

// User management routes
router.get('/pending-users', getPendingUsers);
router.get('/users', getAllUsers);
router.get('/stats', getUserStats);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);

export default router;
