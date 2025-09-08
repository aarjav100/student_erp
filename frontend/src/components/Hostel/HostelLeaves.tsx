import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';
import { format } from 'date-fns';
import axios from '../../lib/axios';

const HostelLeaves: React.FC = () => {
  const { user, token } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
  });
  const [reviewData, setReviewData] = useState({
    action: 'approve',
    notes: '',
  });

  const isAdmin = user?.role === 'admin';
  const isWarden = user?.role === 'warden';
  const isAdminOrWarden = isAdmin || isWarden;

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/hostel/leaves', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Leave application submitted successfully',
      });
      setOpenApplyDialog(false);
      setFormData({
        fromDate: '',
        toDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (error) {
      console.error('Error applying for leave:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit leave application',
        variant: 'destructive',
      });
    }
  };

  const handleReviewLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/hostel/leaves/${selectedLeave._id}/review`, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: `Leave application ${reviewData.action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
      setOpenReviewDialog(false);
      setReviewData({
        action: 'approve',
        notes: '',
      });
      fetchLeaves();
    } catch (error) {
      console.error('Error reviewing leave:', error);
      toast({
        title: 'Error',
        description: 'Failed to review leave application',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center">Loading leaves...</div>;
  }

  return (
    <div className="space-y-4">
      {!isAdminOrWarden && (
        <div className="flex justify-end">
          <Dialog open={openApplyDialog} onOpenChange={setOpenApplyDialog}>
            <DialogTrigger asChild>
              <Button>Apply for Leave</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for Hostel Leave</DialogTitle>
                <DialogDescription>
                  Fill in the details to apply for a hostel leave.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleApplyLeave}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fromDate" className="text-right">
                      From Date
                    </Label>
                    <Input
                      id="fromDate"
                      type="date"
                      value={formData.fromDate}
                      onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="toDate" className="text-right">
                      To Date
                    </Label>
                    <Input
                      id="toDate"
                      type="date"
                      value={formData.toDate}
                      onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">
                      Reason
                    </Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Submit Application</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {leaves.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No leave applications found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdminOrWarden && <TableHead>Student</TableHead>}
                <TableHead>From Date</TableHead>
                <TableHead>To Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied On</TableHead>
                {isAdminOrWarden && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave._id}>
                  {isAdminOrWarden && (
                    <TableCell>
                      {leave.student?.name || leave.student}
                    </TableCell>
                  )}
                  <TableCell>{format(new Date(leave.fromDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(leave.toDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  <TableCell>{format(new Date(leave.createdAt), 'dd/MM/yyyy')}</TableCell>
                  {isAdminOrWarden && leave.status === 'pending' && (
                    <TableCell>
                      <Dialog open={openReviewDialog && selectedLeave?._id === leave._id} onOpenChange={(open) => {
                        setOpenReviewDialog(open);
                        if (open) setSelectedLeave(leave);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Leave Application</DialogTitle>
                            <DialogDescription>
                              Review the leave application from {leave.student?.name || 'student'}.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleReviewLeave}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="action" className="text-right">
                                  Action
                                </Label>
                                <div className="col-span-3 flex space-x-4">
                                  <Button
                                    type="button"
                                    variant={reviewData.action === 'approve' ? 'default' : 'outline'}
                                    onClick={() => setReviewData({ ...reviewData, action: 'approve' })}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={reviewData.action === 'reject' ? 'default' : 'outline'}
                                    onClick={() => setReviewData({ ...reviewData, action: 'reject' })}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="notes" className="text-right">
                                  Notes
                                </Label>
                                <Textarea
                                  id="notes"
                                  value={reviewData.notes}
                                  onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit">Submit Review</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  )}
                  {isAdminOrWarden && leave.status !== 'pending' && (
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {leave.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default HostelLeaves;