import HostelRoom from '../models/HostelRoom.js';
import HostelFee from '../models/HostelFee.js';
import MealPlan from '../models/MealPlan.js';
import MealSubscription from '../models/MealSubscription.js';
import MealFeedback from '../models/MealFeedback.js';
import HostelLeave from '../models/HostelLeave.js';
import HostelComplaint from '../models/HostelComplaint.js';
import RoomChangeRequest from '../models/RoomChangeRequest.js';
import MealMenu from '../models/MealMenu.js';

// Rooms
export const listRooms = async (req, res) => {
  const rooms = await HostelRoom.find().lean();
  res.json({ success: true, data: rooms });
};

export const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomType, capacity, floor, notes } = req.body;
    const room = await HostelRoom.create({ roomNumber, roomType, capacity, floor, notes });
    res.status(201).json({ success: true, data: room });
  } catch (err) { next(err); }
};

export const allocateRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const room = await HostelRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ success: false, error: 'Room is full' });
    }
    if (!room.occupants.find(id => id.toString() === studentId)) {
      room.occupants.push(studentId);
    }
    room.status = room.occupants.length === room.capacity ? 'occupied' : 'reserved';
    await room.save();
    res.json({ success: true, data: room });
  } catch (err) { next(err); }
};

export const deallocateRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const room = await HostelRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    room.occupants = room.occupants.filter(id => id.toString() !== studentId);
    room.status = room.occupants.length === 0 ? 'available' : 'reserved';
    await room.save();
    res.json({ success: true, data: room });
  } catch (err) { next(err); }
};

// Fees
export const createHostelFee = async (req, res, next) => {
  try {
    const fee = await HostelFee.create(req.body);
    res.status(201).json({ success: true, data: fee });
  } catch (err) { next(err); }
};

export const listMyFees = async (req, res, next) => {
  try {
    const fees = await HostelFee.find({ student: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: fees });
  } catch (err) { next(err); }
};

export const listAllFees = async (req, res, next) => {
  try {
    const fees = await HostelFee.find().populate('student').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: fees });
  } catch (err) { next(err); }
};

export const payFee = async (req, res, next) => {
  try {
    const fee = await HostelFee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, error: 'Fee not found' });
    if (fee.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not allowed' });
    }
    fee.status = 'paid';
    fee.paidAt = new Date();
    fee.paymentMethod = req.body.paymentMethod || 'online';
    fee.receiptNumber = fee.receiptNumber || `HRC-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    await fee.save();
    res.json({ success: true, data: fee });
  } catch (err) { next(err); }
};

// Receipt fetch
export const getFeeReceipt = async (req, res, next) => {
  try {
    const fee = await HostelFee.findById(req.params.id).populate('student');
    if (!fee) return res.status(404).json({ success: false, error: 'Fee not found' });
    if (req.user.role === 'student' && fee.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not allowed' });
    }
    res.json({ success: true, data: {
      receiptNumber: fee.receiptNumber,
      student: { id: fee.student._id, name: fee.student.name, email: fee.student.email },
      periodStart: fee.periodStart,
      periodEnd: fee.periodEnd,
      amount: fee.amount,
      status: fee.status,
      paidAt: fee.paidAt,
      paymentMethod: fee.paymentMethod,
    }});
  } catch (err) { next(err); }
};

// Meal Plans and subscriptions
export const listMealPlans = async (req, res) => {
  const plans = await MealPlan.find({ isActive: true }).lean();
  res.json({ success: true, data: plans });
};

export const createMealPlan = async (req, res, next) => {
  try {
    const plan = await MealPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) { next(err); }
};

export const subscribeMealPlan = async (req, res, next) => {
  try {
    const { mealPlan, startDate } = req.body;
    const sub = await MealSubscription.create({ student: req.user._id, mealPlan, startDate });
    res.status(201).json({ success: true, data: sub });
  } catch (err) { next(err); }
};

export const myMealSubscription = async (req, res, next) => {
  try {
    const subs = await MealSubscription.find({ student: req.user._id, status: 'active' }).populate('mealPlan').lean();
    res.json({ success: true, data: subs });
  } catch (err) { next(err); }
};

export const mealFeedback = async (req, res, next) => {
  try {
    const { rating, comments } = req.body;
    const feedback = await MealFeedback.create({ student: req.user._id, rating, comments });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) { next(err); }
};

export const subscribeMealPlanById = async (req, res, next) => {
  try {
    const mealPlanId = req.params.mealPlanId;
    const existing = await MealSubscription.findOne({ student: req.user._id, status: 'active' });
    if (existing) {
      existing.status = 'cancelled';
      existing.endDate = new Date();
      await existing.save();
    }
    const sub = await MealSubscription.create({ student: req.user._id, mealPlan: mealPlanId, startDate: new Date() });
    res.status(201).json({ success: true, data: sub });
  } catch (err) { next(err); }
};

export const unsubscribeMealPlanById = async (req, res, next) => {
  try {
    const mealPlanId = req.params.mealPlanId;
    const sub = await MealSubscription.findOne({ student: req.user._id, mealPlan: mealPlanId, status: 'active' });
    if (!sub) return res.status(404).json({ success: false, error: 'No active subscription found' });
    sub.status = 'cancelled';
    sub.endDate = new Date();
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};

// Weekly Menu
export const getWeeklyMenu = async (req, res, next) => {
  try {
    const { weekStart } = req.query;
    let menu;
    if (weekStart) {
      menu = await MealMenu.findOne({ weekStart: new Date(weekStart) }).lean();
    } else {
      menu = await MealMenu.findOne({ isActive: true }).sort({ weekStart: -1 }).lean();
    }
    res.json({ success: true, data: menu });
  } catch (err) { next(err); }
};

export const upsertWeeklyMenu = async (req, res, next) => {
  try {
    const { weekStart, weekEnd, days } = req.body;
    const updated = await MealMenu.findOneAndUpdate(
      { weekStart: new Date(weekStart) },
      { weekStart, weekEnd, days, isActive: true },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// Leave workflow
export const applyLeave = async (req, res, next) => {
  try {
    const { fromDate, toDate, reason } = req.body;
    const leave = await HostelLeave.create({ student: req.user._id, fromDate, toDate, reason });
    res.status(201).json({ success: true, data: leave });
  } catch (err) { next(err); }
};

export const myLeaves = async (req, res, next) => {
  try {
    const leaves = await HostelLeave.find({ student: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: leaves });
  } catch (err) { next(err); }
};

export const listLeaves = async (req, res, next) => {
  try {
    const leaves = await HostelLeave.find().populate('student').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: leaves });
  } catch (err) { next(err); }
};

export const reviewLeave = async (req, res, next) => {
  try {
    const { action, notes } = req.body; // action: 'approve' | 'reject'
    const leave = await HostelLeave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, error: 'Leave not found' });
    leave.status = action === 'approve' ? 'approved' : 'rejected';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.notes = notes;
    await leave.save();
    res.json({ success: true, data: leave });
  } catch (err) { next(err); }
};

// Room change requests
export const requestRoomChange = async (req, res, next) => {
  try {
    const { preferredRoomType, preferredBlock, reason } = req.body;
    const currentRoom = await HostelRoom.findOne({ occupants: req.user._id }).lean();
    const reqDoc = await RoomChangeRequest.create({
      student: req.user._id,
      currentRoom: currentRoom?._id,
      preferredRoomType,
      preferredBlock,
      reason,
    });
    res.status(201).json({ success: true, data: reqDoc });
  } catch (err) { next(err); }
};

export const listRoomChangeRequests = async (req, res, next) => {
  try {
    const docs = await RoomChangeRequest.find().populate('student currentRoom').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
};

export const reviewRoomChange = async (req, res, next) => {
  try {
    const { action, notes } = req.body; // approve | reject
    const doc = await RoomChangeRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Request not found' });
    doc.status = action === 'approve' ? 'approved' : 'rejected';
    doc.reviewedBy = req.user._id;
    doc.reviewedAt = new Date();
    doc.notes = notes;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Dashboard (student)
export const getStudentDashboard = async (req, res, next) => {
  try {
    const [room, fees, sub, leaves, complaints, notices] = await Promise.all([
      HostelRoom.findOne({ occupants: req.user._id }).lean(),
      HostelFee.find({ student: req.user._id }).sort({ createdAt: -1 }).limit(5).lean(),
      MealSubscription.findOne({ student: req.user._id, status: 'active' }).populate('mealPlan').lean(),
      HostelLeave.find({ student: req.user._id }).sort({ createdAt: -1 }).limit(5).lean(),
      HostelComplaint.find({ student: req.user._id }).sort({ createdAt: -1 }).limit(5).lean(),
      HostelNotice.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    const stats = {
      totalRooms: await HostelRoom.countDocuments({}),
      occupiedRooms: await HostelRoom.countDocuments({ status: 'occupied' }),
      pendingLeaves: await HostelLeave.countDocuments({ status: 'pending' }),
    };
    res.json({ success: true, data: { room, fees, mealSubscription: sub, leaves, complaints, notices, stats } });
  } catch (err) { next(err); }
};

// Dashboard (warden)
export const getWardenDashboard = async (req, res, next) => {
  try {
    const [rooms, leaves, complaints, fees] = await Promise.all([
      HostelRoom.find().lean(),
      HostelLeave.find({ status: 'pending' }).populate('student').lean(),
      HostelComplaint.find({ status: { $in: ['open', 'in_progress'] } }).populate('student').lean(),
      HostelFee.find({ status: { $in: ['pending', 'overdue'] } }).populate('student').lean(),
    ]);
    const stats = {
      totalRooms: await HostelRoom.countDocuments({}),
      occupiedRooms: await HostelRoom.countDocuments({ status: 'occupied' }),
      pendingLeaves: leaves.length,
    };
    res.json({ success: true, data: { rooms, leaves, complaints, fees, stats } });
  } catch (err) { next(err); }
};

// Complaints
export const createComplaint = async (req, res, next) => {
  try {
    const { category, description } = req.body;
    const complaint = await HostelComplaint.create({ student: req.user._id, category, description });
    res.status(201).json({ success: true, data: complaint });
  } catch (err) { next(err); }
};

export const myComplaints = async (req, res, next) => {
  try {
    const complaints = await HostelComplaint.find({ student: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: complaints });
  } catch (err) { next(err); }
};

export const listComplaints = async (req, res, next) => {
  try {
    const complaints = await HostelComplaint.find().populate('student').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: complaints });
  } catch (err) { next(err); }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, assignedTo, resolutionNotes } = req.body;
    const complaint = await HostelComplaint.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, resolutionNotes, resolvedAt: status === 'resolved' || status === 'closed' ? new Date() : undefined },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (err) { next(err); }
};

// Notices
import HostelNotice from '../models/HostelNotice.js';

export const listNotices = async (req, res, next) => {
  try {
    const now = new Date();
    const notices = await HostelNotice.find({
      isActive: true,
      $or: [ { validTill: null }, { validTill: { $gte: now } } ],
    }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: notices });
  } catch (err) { next(err); }
};

export const createNotice = async (req, res, next) => {
  try {
    const notice = await HostelNotice.create({ ...req.body, publishedBy: req.user._id });
    res.status(201).json({ success: true, data: notice });
  } catch (err) { next(err); }
};

export const updateNotice = async (req, res, next) => {
  try {
    const notice = await HostelNotice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ success: false, error: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (err) { next(err); }
};


