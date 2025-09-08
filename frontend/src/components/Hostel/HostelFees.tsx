import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';
import { format } from 'date-fns';
import axios from '../../lib/axios';

const HostelFees: React.FC = () => {
  const { user, token } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    student: '',
    amount: '',
    periodStart: '',
    periodEnd: '',
    notes: '',
  });
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'online',
  });

  const isAdmin = user?.role === 'admin';
  const isWarden = user?.role === 'warden';
  const isAccountant = user?.role === 'accountant';
  const isAdminOrWardenOrAccountant = isAdmin || isWarden || isAccountant;

  useEffect(() => {
    fetchFees();
    if (isAdminOrWardenOrAccountant) {
      fetchStudents();
    }
  }, [isAdminOrWardenOrAccountant]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const endpoint = isAdminOrWardenOrAccountant ? '/hostel/fees' : '/hostel/fees/my';
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
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/users/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/hostel/fees', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Fee created successfully',
      });
      setOpenCreateDialog(false);
      setFormData({
        student: '',
        amount: '',
        periodStart: '',
        periodEnd: '',
        notes: '',
      });
      fetchFees();
    } catch (error) {
      console.error('Error creating fee:', error);
      toast({
        title: 'Error',
        description: 'Failed to create fee',
        variant: 'destructive',
      });
    }
  };

  const handlePayFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/hostel/fees/${selectedFee._id}/pay`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Fee paid successfully',
      });
      setOpenPayDialog(false);
      setPaymentData({
        paymentMethod: 'online',
      });
      fetchFees();
    } catch (error) {
      console.error('Error paying fee:', error);
      toast({
        title: 'Error',
        description: 'Failed to pay fee',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-500">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center">Loading fees...</div>;
  }

  return (
    <div className="space-y-4">
      {isAdminOrWardenOrAccountant && (
        <div className="flex justify-end">
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button>Create Fee</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Hostel Fee</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new hostel fee.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateFee}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="student" className="text-right">
                      Student
                    </Label>
                    <Select
                      value={formData.student}
                      onValueChange={(value) => setFormData({ ...formData, student: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.name} ({student.registrationNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="periodStart" className="text-right">
                      Period Start
                    </Label>
                    <Input
                      id="periodStart"
                      type="date"
                      value={formData.periodStart}
                      onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="periodEnd" className="text-right">
                      Period End
                    </Label>
                    <Input
                      id="periodEnd"
                      type="date"
                      value={formData.periodEnd}
                      onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Fee</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {fees.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No hostel fees found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdminOrWardenOrAccountant && <TableHead>Student</TableHead>}
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee._id}>
                  {isAdminOrWardenOrAccountant && (
                    <TableCell>
                      {fee.student?.name || fee.student}
                    </TableCell>
                  )}
                  <TableCell>₹{fee.amount}</TableCell>
                  <TableCell>
                    {format(new Date(fee.periodStart), 'dd/MM/yyyy')} to {format(new Date(fee.periodEnd), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{getStatusBadge(fee.status)}</TableCell>
                  <TableCell>
                    {fee.receiptNumber ? fee.receiptNumber : '-'}
                  </TableCell>
                  <TableCell>
                    {fee.status === 'pending' && !isAdminOrWardenOrAccountant && (
                      <Dialog open={openPayDialog && selectedFee?._id === fee._id} onOpenChange={(open) => {
                        setOpenPayDialog(open);
                        if (open) setSelectedFee(fee);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Pay Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Pay Hostel Fee</DialogTitle>
                            <DialogDescription>
                              Pay your hostel fee of ₹{fee.amount}.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handlePayFee}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="paymentMethod" className="text-right">
                                  Payment Method
                                </Label>
                                <Select
                                  value={paymentData.paymentMethod}
                                  onValueChange={(value) => setPaymentData({ paymentMethod: value })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit">Pay Now</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                    {fee.status === 'paid' && (
                      <span className="text-sm text-green-600">Paid on {fee.paidAt ? format(new Date(fee.paidAt), 'dd/MM/yyyy') : 'N/A'}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default HostelFees;