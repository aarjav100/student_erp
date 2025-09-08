import express from 'express';
import {
  listRooms,
  createRoom,
  allocateRoom,
  deallocateRoom,
  createHostelFee,
  listMyFees,
  payFee,
  getFeeReceipt,
  listAllFees,
  listMealPlans,
  createMealPlan,
  subscribeMealPlan,
  myMealSubscription,
  mealFeedback,
  getWeeklyMenu,
  upsertWeeklyMenu,
  subscribeMealPlanById,
  unsubscribeMealPlanById,
  applyLeave,
  myLeaves,
  listLeaves,
  reviewLeave,
  requestRoomChange,
  listRoomChangeRequests,
  reviewRoomChange,
  createComplaint,
  myComplaints,
  listComplaints,
  updateComplaintStatus,
  listNotices,
  createNotice,
  updateNotice,
  getStudentDashboard,
  getWardenDashboard,
} from '../controllers/hostelController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rooms
router.get('/rooms', protect, authorize('admin', 'warden', 'staff'), listRooms);
router.post('/rooms', protect, authorize('admin', 'warden'), createRoom);
router.post('/rooms/:id/allocate', protect, authorize('admin', 'warden'), allocateRoom);
router.post('/rooms/:id/deallocate', protect, authorize('admin', 'warden'), deallocateRoom);

// Fees
router.post('/fees', protect, authorize('admin', 'warden', 'accountant'), createHostelFee);
router.get('/fees/my', protect, listMyFees);
router.get('/fees', protect, authorize('admin', 'warden', 'accountant'), listAllFees);
router.post('/fees/:id/pay', protect, payFee);
router.get('/fees/:id/receipt', protect, getFeeReceipt);

// Meal plans
router.get('/meal-plans', protect, listMealPlans);
router.post('/meal-plans', protect, authorize('admin', 'warden'), createMealPlan);
router.post('/meal-subscriptions', protect, subscribeMealPlan);
router.get('/meal-subscriptions/my', protect, myMealSubscription);
router.post('/meal-feedback', protect, mealFeedback);
router.get('/meal-menu', protect, getWeeklyMenu);
router.post('/meal-menu', protect, authorize('admin', 'warden'), upsertWeeklyMenu);
router.post('/meal-plans/:mealPlanId/subscribe', protect, subscribeMealPlanById);
router.post('/meal-plans/:mealPlanId/unsubscribe', protect, unsubscribeMealPlanById);

// Leave
router.post('/leaves', protect, applyLeave);
router.get('/leaves/my', protect, myLeaves);
router.get('/leaves', protect, authorize('admin', 'warden'), listLeaves);
router.post('/leaves/:id/review', protect, authorize('admin', 'warden'), reviewLeave);

// Room change
router.post('/room-change', protect, requestRoomChange);
router.get('/room-change', protect, authorize('admin', 'warden'), listRoomChangeRequests);
router.post('/room-change/:id/review', protect, authorize('admin', 'warden'), reviewRoomChange);

// Complaints
router.post('/complaints', protect, createComplaint);
router.get('/complaints/my', protect, myComplaints);
router.get('/complaints', protect, authorize('admin', 'warden', 'staff'), listComplaints);
router.patch('/complaints/:id', protect, authorize('admin', 'warden', 'staff'), updateComplaintStatus);

// Notices
router.get('/notices', protect, listNotices);
router.post('/notices', protect, authorize('admin', 'warden'), createNotice);
router.patch('/notices/:id', protect, authorize('admin', 'warden'), updateNotice);

// Dashboards
router.get('/dashboard/student', protect, getStudentDashboard);
router.get('/dashboard/warden', protect, authorize('admin', 'warden'), getWardenDashboard);

export default router;


