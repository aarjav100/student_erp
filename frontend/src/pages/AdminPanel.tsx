import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  BookOpen,
  GraduationCap,
  UserPlus,
  ClipboardList,
  Building2,
  Home,
  FileSpreadsheet,
  FileBarChart2,
  Bell,
  Wrench,
  Megaphone,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CourseManagement from '@/components/Admin/CourseManagement';
import EnrollmentManagement from '@/components/Admin/EnrollmentManagement';
import AttendanceManagement from '@/components/Admin/AttendanceManagement';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'warden';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  rejectedUsers: number;
  byRole: {
    students: number;
    teachers: number;
    admins: number;
  };
}

const AdminPanel = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvedStudents, setApprovedStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [hostelMetrics, setHostelMetrics] = useState({ occupancy: 0, pendingLeaves: 0, pendingComplaints: 0 });
  const [tab, setTab] = useState<'students' | 'attendance' | 'grades' | 'assignments' | 'hostel' | 'leaves' | 'complaints' | 'notices'>('students');

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="h-full w-full p-6 overflow-y-auto overflow-x-hidden bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You need admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchApprovedStudents = async () => {
    try {
      setLoadingStudents(true);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/admin/users?status=approved&role=student&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApprovedStudents(data.data.users || []);
      }
    } catch (e) {
      console.error('Failed to load approved students', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchHostelMetrics = async () => {
    try {
      const resRooms = await fetch('/api/hostel/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
      const roomsData = await resRooms.json();
      const rooms = roomsData?.data || [];
      const total = rooms.length || 0;
      const occupied = rooms.filter((r: any) => r.status === 'occupied').length;
      const occupancy = total ? Math.round((occupied / total) * 100) : 0;

      const leavesRes = await fetch('/api/hostel/leaves', { headers: { 'Authorization': `Bearer ${token}` } });
      const leaves = (await leavesRes.json())?.data || [];
      const pendingLeaves = leaves.filter((l: any) => l.status === 'pending').length;

      const complaintsRes = await fetch('/api/hostel/complaints', { headers: { 'Authorization': `Bearer ${token}` } });
      const complaints = (await complaintsRes.json())?.data || [];
      const pendingComplaints = complaints.filter((c: any) => ['open', 'in_progress'].includes(c.status)).length;

      setHostelMetrics({ occupancy, pendingLeaves, pendingComplaints });
    } catch (e) {
      console.error('Failed to load hostel metrics', e);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        fetchStats();
        fetchApprovedStudents();
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        fetchStats();
        fetchApprovedStudents();
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchApprovedStudents();
    fetchHostelMetrics();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800 border-blue-200',
      teacher: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-orange-100 text-orange-800 border-orange-200',
      warden: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'}>{role}</Badge>;
  };

  return (
    <div className="h-full w-full p-6 overflow-y-auto overflow-x-hidden bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage students, academics, hostel, and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700"><UserPlus className="h-4 w-4 mr-2" />Add Student</Button>
          <Button variant="outline"><ClipboardList className="h-4 w-4 mr-2" />Update Attendance</Button>
          <Button variant="outline"><CheckCircle className="h-4 w-4 mr-2" />Approve Requests</Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.byRole?.students ?? '-'}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance %</p>
                <p className="text-2xl font-bold text-gray-900">—</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hostel Occupancy %</p>
                <p className="text-2xl font-bold text-gray-900">{hostelMetrics.occupancy}%</p>
              </div>
              <Home className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Leave Requests</p>
                <p className="text-2xl font-bold text-gray-900">{hostelMetrics.pendingLeaves}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Complaints Pending</p>
                <p className="text-2xl font-bold text-gray-900">{hostelMetrics.pendingComplaints}</p>
              </div>
              <Wrench className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approved Students quick table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Approved Students</h2>
        <div className="rounded-md border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Student ID</th>
                <th className="px-3 py-2 text-left">Approved At</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingStudents ? (
                <tr><td className="px-3 py-3" colSpan={4}>Loading...</td></tr>
              ) : approvedStudents.length === 0 ? (
                <tr><td className="px-3 py-3" colSpan={4}>No approved students yet.</td></tr>
              ) : (
                approvedStudents.map((s) => (
                  <tr key={s._id} className="border-t">
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.email}</td>
                    <td className="px-3 py-2">{s.studentId || '-'}</td>
                    <td className="px-3 py-2">{s.approvedAt ? new Date(s.approvedAt).toLocaleDateString() : '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            localStorage.setItem('admin:selectedStudentId', s._id);
                            setTab('attendance');
                          }}
                        >
                          Mark Attendance
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            localStorage.setItem('admin:selectedStudentId', s._id);
                            setTab('grades');
                          }}
                        >
                          Assign Grade
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Sections */}
      <Tabs value={tab} onValueChange={(v:any)=>setTab(v)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="students" className="flex items-center gap-2"><Users className="h-4 w-4" />Students</TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2"><ClipboardList className="h-4 w-4" />Attendance</TabsTrigger>
          <TabsTrigger value="grades" className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Grades</TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Assignments</TabsTrigger>
          <TabsTrigger value="hostel" className="flex items-center gap-2"><Home className="h-4 w-4" />Hostel</TabsTrigger>
          <TabsTrigger value="leaves" className="flex items-center gap-2"><Clock className="h-4 w-4" />Leaves</TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-2"><Wrench className="h-4 w-4" />Complaints</TabsTrigger>
          <TabsTrigger value="notices" className="flex items-center gap-2"><Megaphone className="h-4 w-4" />Notices</TabsTrigger>
        </TabsList>

        {/* Students */}
        <TabsContent value="students" className="space-y-6">
          {/* Reuse existing User Management block */}
          {/* Existing code below unchanged */}
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Approve or reject user accounts</CardDescription>
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('approved')}
              >
                Approved
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('rejected')}
              >
                Rejected
              </Button>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {user.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => approveUser(user._id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectUser(user._id)}
                          size="sm"
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {user.status === 'approved' && (
                      <Button
                        onClick={() => rejectUser(user._id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    {user.status === 'rejected' && (
                      <Button
                        onClick={() => approveUser(user._id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {/* Role assign */}
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={user.role}
                      onChange={async (e) => {
                        const newRole = e.target.value;
                        try {
                          await fetch(`/api/admin/users/${user._id}`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role: newRole })
                          });
                          fetchUsers();
                        } catch (err) { console.error(err); }
                      }}
                    >
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                      <option value="warden">warden</option>
                    </select>
                    {/* Edit */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const name = prompt('Name', user.name) || user.name;
                        const email = prompt('Email', user.email) || user.email;
                        try {
                          await fetch(`/api/admin/users/${user._id}`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, email })
                          });
                          fetchUsers();
                        } catch (err) { console.error(err); }
                      }}
                    >
                      Edit
                    </Button>
                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm('Delete this user?')) return;
                        try {
                          await fetch(`/api/admin/users/${user._id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          fetchUsers();
                          fetchStats();
                        } catch (err) { console.error(err); }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance" className="space-y-6">
          <AttendanceManagement />
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Attendance</CardTitle>
              <CardDescription>Upload Excel/CSV to record attendance in bulk.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline"><FileSpreadsheet className="h-4 w-4 mr-2" />Upload CSV</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grades */}
        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grades & Examination</CardTitle>
              <CardDescription>Upload results, calculate GPA/CGPA, generate reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button><FileSpreadsheet className="h-4 w-4 mr-2" />Upload Results</Button>
                <Button variant="outline"><FileBarChart2 className="h-4 w-4 mr-2" />Generate Reports</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignments & Projects</CardTitle>
              <CardDescription>Manage assignments, submissions and grading.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button><ClipboardList className="h-4 w-4 mr-2" />Create Assignment</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hostel */}
        <TabsContent value="hostel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Management</CardTitle>
              <CardDescription>Allocate rooms, track occupancy and fees.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button><Home className="h-4 w-4 mr-2" />Allocate Room</Button>
                <Button variant="outline"><FileBarChart2 className="h-4 w-4 mr-2" />Hostel Reports</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaves */}
        <TabsContent value="leaves" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>View and approve or reject student leave requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline"><CheckCircle className="h-4 w-4 mr-2" />Review Requests</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complaints */}
        <TabsContent value="complaints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complaints & Maintenance</CardTitle>
              <CardDescription>Assign complaints and track resolution progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline"><Wrench className="h-4 w-4 mr-2" />Assign Complaints</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notices */}
        <TabsContent value="notices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notice Board & Announcements</CardTitle>
              <CardDescription>Publish academic/hostel notices and updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button><Megaphone className="h-4 w-4 mr-2" />Publish Notice</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
