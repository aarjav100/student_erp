import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../lib/axios';
import { useAuth } from './AuthContext';
import { toast } from '../components/ui/use-toast';

interface HostelContextType {
  rooms: any[];
  fees: any[];
  mealPlans: any[];
  leaves: any[];
  complaints: any[];
  notices: any[];
  loading: {
    rooms: boolean;
    fees: boolean;
    mealPlans: boolean;
    leaves: boolean;
    complaints: boolean;
    notices: boolean;
  };
  fetchRooms: () => Promise<void>;
  fetchFees: () => Promise<void>;
  fetchMealPlans: () => Promise<void>;
  fetchLeaves: () => Promise<void>;
  fetchComplaints: () => Promise<void>;
  fetchNotices: () => Promise<void>;
  createRoom: (roomData: any) => Promise<void>;
  updateRoom: (roomId: string, roomData: any) => Promise<void>;
  allocateRoom: (roomId: string, studentId: string) => Promise<void>;
  deallocateRoom: (roomId: string, studentId: string) => Promise<void>;
  createFee: (feeData: any) => Promise<void>;
  payFee: (feeId: string, paymentData: any) => Promise<void>;
  createMealPlan: (mealPlanData: any) => Promise<void>;
  subscribeMealPlan: (mealPlanId: string) => Promise<void>;
  unsubscribeMealPlan: (mealPlanId: string) => Promise<void>;
  createLeave: (leaveData: any) => Promise<void>;
  updateLeaveStatus: (leaveId: string, status: string) => Promise<void>;
  createComplaint: (complaintData: any) => Promise<void>;
  updateComplaintStatus: (complaintId: string, status: string) => Promise<void>;
  createNotice: (noticeData: any) => Promise<void>;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export const useHostel = () => {
  const context = useContext(HostelContext);
  if (context === undefined) {
    throw new Error('useHostel must be used within a HostelProvider');
  }
  return context;
};

interface HostelProviderProps {
  children: ReactNode;
}

export const HostelProvider: React.FC<HostelProviderProps> = ({ children }) => {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    rooms: false,
    fees: false,
    mealPlans: false,
    leaves: false,
    complaints: false,
    notices: false,
  });

  const isAdmin = user?.role === 'admin';
  const isWarden = user?.role === 'warden';
  const isAdminOrWarden = isAdmin || isWarden;

  // Fetch functions
  const fetchRooms = async () => {
    try {
      setLoading((prev) => ({ ...prev, rooms: true }));
      const response = await axios.get('/hostel/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hostel rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({ ...prev, rooms: false }));
    }
  };

  const fetchFees = async () => {
    try {
      setLoading((prev) => ({ ...prev, fees: true }));
      const endpoint = isAdminOrWarden ? '/hostel/fees' : '/hostel/fees/my';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFees(response.data.data);
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hostel fees',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({ ...prev, fees: false }));
    }
  };

  const fetchMealPlans = async () => {
    try {
      setLoading((prev) => ({ ...prev, mealPlans: true }));
      const response = await axios.get('/hostel/meal-plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMealPlans(response.data.data);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch meal plans',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({ ...prev, mealPlans: false }));
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading((prev) => ({ ...prev, leaves: true }));
      const endpoint = isAdminOrWarden ? '/hostel/leaves' : '/hostel/leaves/my';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hostel leaves',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({ ...prev, leaves: false }));
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading((prev) => ({ ...prev, complaints: true }));
      const endpoint = isAdminOrWarden ? '/hostel/complaints' : '/hostel/complaints/my';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hostel complaints',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({ ...prev, complaints: false }));
    }
  };

  const fetchNotices = async () => {
    try {
      setLoading((prev) => ({ ...prev, notices: true }));
      const response = await axios.get('/hostel/notices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(response.data.data);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hostel notices',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({ ...prev, notices: false }));
    }
  };

  // Create and update functions
  const createRoom = async (roomData: any) => {
    try {
      const response = await axios.post('/hostel/rooms', roomData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Room created successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRoom = async (roomId: string, roomData: any) => {
    try {
      const response = await axios.put(`/hostel/rooms/${roomId}`, roomData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Room updated successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to update room',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const allocateRoom = async (roomId: string, studentId: string) => {
    try {
      const response = await axios.post(`/hostel/rooms/${roomId}/allocate`, { studentId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Room allocated successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error allocating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to allocate room',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deallocateRoom = async (roomId: string, studentId: string) => {
    try {
      const response = await axios.post(`/hostel/rooms/${roomId}/deallocate`, { studentId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Room deallocated successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error deallocating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to deallocate room',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createFee = async (feeData: any) => {
    try {
      const response = await axios.post('/hostel/fees', feeData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Fee created successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating fee:', error);
      toast({
        title: 'Error',
        description: 'Failed to create fee',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const payFee = async (feeId: string, paymentData: any) => {
    try {
      const response = await axios.post(`/hostel/fees/${feeId}/pay`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Fee paid successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error paying fee:', error);
      toast({
        title: 'Error',
        description: 'Failed to pay fee',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createMealPlan = async (mealPlanData: any) => {
    try {
      const response = await axios.post('/hostel/meal-plans', mealPlanData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Meal plan created successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create meal plan',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const subscribeMealPlan = async (mealPlanId: string) => {
    try {
      const response = await axios.post(`/hostel/meal-plans/${mealPlanId}/subscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Successfully subscribed to meal plan',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error subscribing to meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe to meal plan',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const unsubscribeMealPlan = async (mealPlanId: string) => {
    try {
      const response = await axios.post(`/hostel/meal-plans/${mealPlanId}/unsubscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Successfully unsubscribed from meal plan',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error unsubscribing from meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe from meal plan',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createLeave = async (leaveData: any) => {
    try {
      const response = await axios.post('/hostel/leaves', leaveData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Leave application submitted successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating leave:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit leave application',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateLeaveStatus = async (leaveId: string, status: string) => {
    try {
      const response = await axios.put(`/hostel/leaves/${leaveId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Leave status updated successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update leave status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createComplaint = async (complaintData: any) => {
    try {
      const response = await axios.post('/hostel/complaints', complaintData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Complaint submitted successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit complaint',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: string) => {
    try {
      const response = await axios.put(`/hostel/complaints/${complaintId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Complaint status updated successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update complaint status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createNotice = async (noticeData: any) => {
    try {
      const response = await axios.post('/hostel/notices', noticeData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Notice published successfully',
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating notice:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish notice',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value = {
    rooms,
    fees,
    mealPlans,
    leaves,
    complaints,
    notices,
    loading,
    fetchRooms,
    fetchFees,
    fetchMealPlans,
    fetchLeaves,
    fetchComplaints,
    fetchNotices,
    createRoom,
    updateRoom,
    allocateRoom,
    deallocateRoom,
    createFee,
    payFee,
    createMealPlan,
    subscribeMealPlan,
    unsubscribeMealPlan,
    createLeave,
    updateLeaveStatus,
    createComplaint,
    updateComplaintStatus,
    createNotice,
  };

  return <HostelContext.Provider value={value}>{children}</HostelContext.Provider>;
};