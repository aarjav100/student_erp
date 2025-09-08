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
import axios from '../../lib/axios';

const HostelRooms: React.FC = () => {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openAllocateDialog, setOpenAllocateDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'single',
    capacity: 1,
    floor: 1,
    notes: '',
  });
  const [allocateData, setAllocateData] = useState({
    studentId: '',
  });

  const userRole = (user?.role as unknown as string) || '';
  const isAdmin = userRole === 'admin';
  const isWarden = userRole === 'warden';
  const isAdminOrWarden = isAdmin || isWarden;

  useEffect(() => {
    fetchRooms();
    if (isAdminOrWarden) {
      fetchStudents();
    }
  }, [isAdminOrWarden]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/hostel/rooms', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Room created successfully',
      });
      setOpenCreateDialog(false);
      setFormData({
        roomNumber: '',
        roomType: 'single',
        capacity: 1,
        floor: 1,
        notes: '',
      });
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    }
  };

  const handleAllocateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/hostel/rooms/${selectedRoom._id}/allocate`, allocateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Room allocated successfully',
      });
      setOpenAllocateDialog(false);
      setAllocateData({ studentId: '' });
      fetchRooms();
    } catch (error) {
      console.error('Error allocating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to allocate room',
        variant: 'destructive',
      });
    }
  };

  const handleDeallocateRoom = async (roomId: string, studentId: string) => {
    try {
      await axios.post(`/hostel/rooms/${roomId}/deallocate`, { studentId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Room deallocated successfully',
      });
      fetchRooms();
    } catch (error) {
      console.error('Error deallocating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to deallocate room',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-red-500">Occupied</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500">Maintenance</Badge>;
      case 'reserved':
        return <Badge className="bg-blue-500">Reserved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center">Loading rooms...</div>;
  }

  return (
    <div className="space-y-4">
      {isAdminOrWarden && (
        <div className="flex justify-end">
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button>Create New Room</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Hostel Room</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new hostel room.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRoom}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="roomNumber" className="text-right">
                      Room Number
                    </Label>
                    <Input
                      id="roomNumber"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="roomType" className="text-right">
                      Room Type
                    </Label>
                    <Select
                      value={formData.roomType}
                      onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="triple">Triple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">
                      Capacity
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="3"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="floor" className="text-right">
                      Floor
                    </Label>
                    <Input
                      id="floor"
                      type="number"
                      min="1"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
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
                  <Button type="submit">Create Room</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No hostel rooms found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Occupancy</TableHead>
                {isAdminOrWarden && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room._id}>
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell className="capitalize">{room.roomType}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{getStatusBadge(room.status)}</TableCell>
                  <TableCell>
                    {room.occupants?.length || 0} / {room.capacity}
                  </TableCell>
                  {isAdminOrWarden && (
                    <TableCell>
                      {room.status !== 'occupied' && (
                        <Dialog open={openAllocateDialog && selectedRoom?._id === room._id} onOpenChange={(open) => {
                          setOpenAllocateDialog(open);
                          if (open) setSelectedRoom(room);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mr-2">
                              Allocate
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Allocate Room</DialogTitle>
                              <DialogDescription>
                                Allocate room {room.roomNumber} to a student.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAllocateRoom}>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="studentId" className="text-right">
                                    Student
                                  </Label>
                                  <Select
                                    value={allocateData.studentId}
                                    onValueChange={(value) => setAllocateData({ studentId: value })}
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
                              </div>
                              <DialogFooter>
                                <Button type="submit">Allocate</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                      {room.occupants?.length > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeallocateRoom(room._id, room.occupants[0])}
                        >
                          Deallocate
                        </Button>
                      )}
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

export default HostelRooms;