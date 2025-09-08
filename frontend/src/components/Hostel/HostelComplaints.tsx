import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';
import { format } from 'date-fns';
import axios from '../../lib/axios';

const HostelComplaints: React.FC = () => {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [formData, setFormData] = useState({
    category: 'electricity',
    description: '',
  });
  const [updateData, setUpdateData] = useState({
    status: 'in_progress',
    assignedTo: '',
    resolutionNotes: '',
  });

  const isAdmin = user?.role === 'admin';
  const isWarden = user?.role === 'warden';
  const isStaff = user?.role === 'staff';
  const isAdminOrWardenOrStaff = isAdmin || isWarden || isStaff;

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const endpoint = isAdminOrWardenOrStaff ? '/hostel/complaints' : '/hostel/complaints/my';
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
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/hostel/complaints', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Complaint submitted successfully',
      });
      setOpenCreateDialog(false);
      setFormData({
        category: 'electricity',
        description: '',
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error creating complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit complaint',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(`/hostel/complaints/${selectedComplaint._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Complaint updated successfully',
      });
      setOpenUpdateDialog(false);
      setUpdateData({
        status: 'in_progress',
        assignedTo: '',
        resolutionNotes: '',
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to update complaint',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-yellow-500">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'electricity':
        return 'Electricity';
      case 'water':
        return 'Water';
      case 'cleaning':
        return 'Cleaning';
      case 'maintenance':
        return 'Maintenance';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };

  if (loading) {
    return <div className="flex justify-center">Loading complaints...</div>;
  }

  return (
    <div className="space-y-4">
      {!isAdminOrWardenOrStaff && (
        <div className="flex justify-end">
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button>Submit Complaint</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Hostel Complaint</DialogTitle>
                <DialogDescription>
                  Fill in the details to submit a hostel complaint.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateComplaint}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Submit Complaint</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No complaints found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdminOrWardenOrStaff && <TableHead>Student</TableHead>}
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted On</TableHead>
                {isAdminOrWardenOrStaff && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint._id}>
                  {isAdminOrWardenOrStaff && (
                    <TableCell>
                      {complaint.student?.name || complaint.student}
                    </TableCell>
                  )}
                  <TableCell>{getCategoryLabel(complaint.category)}</TableCell>
                  <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell>{format(new Date(complaint.createdAt), 'dd/MM/yyyy')}</TableCell>
                  {isAdminOrWardenOrStaff && (
                    <TableCell>
                      <Dialog open={openUpdateDialog && selectedComplaint?._id === complaint._id} onOpenChange={(open) => {
                        setOpenUpdateDialog(open);
                        if (open) {
                          setSelectedComplaint(complaint);
                          setUpdateData({
                            status: complaint.status,
                            assignedTo: complaint.assignedTo || '',
                            resolutionNotes: complaint.resolutionNotes || '',
                          });
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Complaint Status</DialogTitle>
                            <DialogDescription>
                              Update the status of the complaint from {complaint.student?.name || 'student'}.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleUpdateComplaint}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                  Status
                                </Label>
                                <Select
                                  value={updateData.status}
                                  onValueChange={(value) => setUpdateData({ ...updateData, status: value })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="assignedTo" className="text-right">
                                  Assigned To
                                </Label>
                                <Input
                                  id="assignedTo"
                                  value={updateData.assignedTo}
                                  onChange={(e) => setUpdateData({ ...updateData, assignedTo: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="resolutionNotes" className="text-right">
                                  Resolution Notes
                                </Label>
                                <Textarea
                                  id="resolutionNotes"
                                  value={updateData.resolutionNotes}
                                  onChange={(e) => setUpdateData({ ...updateData, resolutionNotes: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit">Update Complaint</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
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

export default HostelComplaints;