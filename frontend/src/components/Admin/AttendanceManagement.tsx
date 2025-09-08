import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  BookOpen, 
  Calendar,
  Clock,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Download,
  Upload,
  Filter,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  program: string;
  rollNo?: string;
  className?: string;
  section?: string;
}

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  department: string;
  degree: string;
  maxStudents: number;
  currentEnrollment: number;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  courseId: string;
}

interface AttendanceRecord {
  _id: string;
  studentId: Student;
  courseId: Course;
  subjectId?: Subject;
  status: 'present' | 'absent' | 'late' | 'excused' | 'leave';
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  duration: number;
  semester: string;
  year: number;
  markedBy: {
    _id: string;
    name: string;
    email: string;
  };
  markedAt: string;
  notes?: string;
  isLate: boolean;
  lateMinutes: number;
  isExcused: boolean;
  excuseReason?: string;
}

interface AttendanceStats {
  totalRecords: number;
  totalStudents: number;
  totalCourses: number;
  statusCounts: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    leave: number;
  };
  attendancePercentage: number;
}

const AttendanceManagement: React.FC = () => {
  const { toast } = useToast();
  const { token, user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'manage' | 'reports' | 'notifications' | 'admin'>('dashboard');

  // Dialog states
  const [isMarkAttendanceDialogOpen, setIsMarkAttendanceDialogOpen] = useState(false);
  const [isViewAttendanceDialogOpen, setIsViewAttendanceDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);

  // Form states
  const [attendanceForm, setAttendanceForm] = useState({
    courseId: '',
    subjectId: '',
    date: new Date().toISOString().split('T')[0],
    semester: 'Fall 2024',
    year: 2024,
    notes: ''
  });

  const [studentAttendance, setStudentAttendance] = useState<{[key: string]: {
    status: 'present' | 'absent' | 'late' | 'excused' | 'leave';
    checkInTime?: string;
    notes?: string;
    excuseReason?: string;
  }}>({});

  // Filter states
  const [filters, setFilters] = useState({
    courseId: '',
    subjectId: '',
    date: '',
    status: '',
    semester: '',
    year: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCourses(),
        fetchSubjects(),
        fetchAttendanceRecords(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_BASE_URL}/attendance?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.data.attendance);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const exportRecordsToCSV = () => {
    const headers = [
      'Student Name','Roll No','Class','Section','Email','Course Code','Course Title','Subject Code','Subject Name','Date','Status','Check-in','Marked By','Marked At'
    ];
    const rows = attendanceRecords.map(r => [
      r.studentId?.name || '',
      (r.studentId as any)?.rollNo || '',
      (r.studentId as any)?.className || '',
      (r.studentId as any)?.section || '',
      r.studentId?.email || '',
      r.courseId?.courseCode || '',
      r.courseId?.title || '',
      r.subjectId?.code || '',
      r.subjectId?.name || '',
      r.date ? new Date(r.date).toLocaleDateString() : '',
      r.status || '',
      r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '',
      r.markedBy?.name || '',
      r.markedAt ? new Date(r.markedAt).toLocaleString() : ''
    ]);
    const csv = [headers, ...rows].map(cols => cols.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_records_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchStudentsForCourse = async (courseId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/students/${courseId}?date=${attendanceForm.date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data.students);
        
        // Initialize student attendance with existing data
        const existingAttendance: {[key: string]: any} = {};
        data.data.existingAttendance.forEach((record: AttendanceRecord) => {
          existingAttendance[record.studentId._id] = {
            status: record.status,
            checkInTime: record.checkInTime,
            notes: record.notes,
            excuseReason: record.excuseReason
          };
        });
        setStudentAttendance(existingAttendance);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: studentAttendance[student._id]?.status || 'absent',
        checkInTime: studentAttendance[student._id]?.checkInTime,
        notes: studentAttendance[student._id]?.notes,
        excuseReason: studentAttendance[student._id]?.excuseReason
      }));

      const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...attendanceForm,
          attendanceData
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        });
        setIsMarkAttendanceDialogOpen(false);
        setStudentAttendance({});
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const handleBulkMark = async (status: 'present' | 'absent' | 'late' | 'excused' | 'leave') => {
    const updatedAttendance = { ...studentAttendance };
    students.forEach(student => {
      updatedAttendance[student._id] = {
        ...updatedAttendance[student._id],
        status
      };
    });
    setStudentAttendance(updatedAttendance);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'leave': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
      case 'excused': return <AlertCircle className="h-4 w-4" />;
      case 'leave': return <UserX className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Mark and manage student attendance in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsMarkAttendanceDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserCheck className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
          <Button variant="outline" onClick={exportRecordsToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card><CardContent className="p-6"><div className="flex items-center"><Users className="h-8 w-8 text-blue-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Total Students</p><p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center"><BookOpen className="h-8 w-8 text-green-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Total Courses</p><p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center"><CheckCircle className="h-8 w-8 text-green-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Present</p><p className="text-2xl font-bold text-gray-900">{stats.statusCounts.present}</p></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center"><XCircle className="h-8 w-8 text-red-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Absent</p><p className="text-2xl font-bold text-gray-900">{stats.statusCounts.absent}</p></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center"><BarChart3 className="h-8 w-8 text-purple-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Attendance %</p><p className="text-2xl font-bold text-gray-900">{stats.attendancePercentage}%</p></div></div></CardContent></Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Trends</CardTitle>
              <CardDescription>Monthly and weekly attendance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Monthly Trend</p>
                  <div className="h-32 bg-gradient-to-r from-blue-50 to-blue-100 border rounded flex items-end gap-1 p-2">
                    {Array.from({length:12}).map((_,i)=>{
                      const val = Math.floor(Math.random()*60)+40;
                      return <div key={i} className="flex-1 bg-blue-500/70" style={{height: `${val}%`}} />
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Weekly Trend</p>
                  <div className="h-32 bg-gradient-to-r from-purple-50 to-purple-100 border rounded flex items-end gap-1 p-2">
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>{
                      const val = Math.floor(Math.random()*60)+40;
                      return <div key={d} className="flex-1 bg-purple-500/70" style={{height: `${val}%`}} />
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                <div className="col-span-1">
                  <Label>Course</Label>
                  <Select value={filters.courseId} onValueChange={(value) => setFilters({...filters, courseId: value})}>
                    <SelectTrigger><SelectValue placeholder="All Courses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Courses</SelectItem>
                      {courses.map((course) => (<SelectItem key={course._id} value={course._id}>{course.courseCode} - {course.title}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={filters.subjectId} onValueChange={(value) => setFilters({...filters, subjectId: value})}>
                    <SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Subjects</SelectItem>
                      {subjects.map((subject) => (<SelectItem key={subject._id} value={subject._id}>{subject.code} - {subject.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="excused">Excused</SelectItem>
                      <SelectItem value="leave">Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Teacher</Label>
                  <Input placeholder="Teacher name" onChange={(e)=>setFilters({...filters, teacher: e.target.value as any})} />
                </div>
                <div>
                  <Label>Class</Label>
                  <Input placeholder="Class/Section" onChange={(e)=>setFilters({...filters, class: e.target.value as any})} />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={exportRecordsToCSV} className="w-full"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>View and manage all attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Student</th>
                      <th className="text-left p-4">Roll No</th>
                      <th className="text-left p-4">Class</th>
                      <th className="text-left p-4">Section</th>
                      <th className="text-left p-4">Course</th>
                      <th className="text-left p-4">Subject</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Check-in</th>
                      <th className="text-left p-4">Marked By</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{record.studentId.name}</p>
                            <p className="text-sm text-gray-600">{record.studentId.email}</p>
                          </div>
                        </td>
                        <td className="p-4">{(record.studentId as any)?.rollNo || '-'}</td>
                        <td className="p-4">{(record.studentId as any)?.className || '-'}</td>
                        <td className="p-4">{(record.studentId as any)?.section || '-'}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{record.courseId.courseCode}</p>
                            <p className="text-sm text-gray-600">{record.courseId.title}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {record.subjectId ? (
                            <div>
                              <p className="font-medium">{record.subjectId.code}</p>
                              <p className="text-sm text-gray-600">{record.subjectId.name}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4"><p className="text-sm">{new Date(record.date).toLocaleDateString()}</p></td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(record.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(record.status)}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4">{record.checkInTime ? (<p className="text-sm">{new Date(record.checkInTime).toLocaleTimeString()}</p>) : (<span className="text-gray-400">-</span>)}</td>
                        <td className="p-4"><div><p className="font-medium">{record.markedBy.name}</p><p className="text-sm text-gray-600">{new Date(record.markedAt).toLocaleDateString()}</p></div></td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setSelectedAttendance(record); setIsViewAttendanceDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</Button>
                    <span className="flex items-center px-4">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
              <CardDescription>Use the dialog below to mark attendance in bulk</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsMarkAttendanceDialogOpen(true)}>
                <UserCheck className="h-4 w-4 mr-2" /> Open Mark Attendance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Reports & Analytics</CardTitle><CardDescription>Download or view attendance reports</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Student-wise Report</Button>
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Class-wise Report</Button>
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Defaulters List</Button>
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Monthly Report</Button>
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Semester-wise Report</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Notifications & Alerts</CardTitle><CardDescription>Configure absentee and low-attendance alerts</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Absentee Alert Channel</Label>
                  <Select defaultValue="sms"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sms">SMS</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem></SelectContent></Select>
                </div>
                <div>
                  <Label>Low Attendance Threshold (%)</Label>
                  <Input type="number" defaultValue={75} />
                </div>
                <div className="flex items-end"><Button>Save Settings</Button></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Admin Controls</CardTitle><CardDescription>Assign teachers, approve leaves, and set rules</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Assign Teacher</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{courses.map(c=>(<SelectItem key={c._id} value={c._id}>{c.courseCode} - {c.title}</SelectItem>))}</SelectContent></Select>
                </div>
                <div>
                  <Label>Minimum Attendance (%)</Label>
                  <Input type="number" defaultValue={75} />
                </div>
                <div>
                  <Label>Grace Days</Label>
                  <Input type="number" defaultValue={2} />
                </div>
              </div>
              <div className="flex justify-end"><Button>Save</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mark Attendance Dialog */}
      <Dialog open={isMarkAttendanceDialogOpen} onOpenChange={setIsMarkAttendanceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>Mark attendance for students in a course</DialogDescription>
            {students.length > 0 && (
              <div className="mt-2">
                <Badge className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Students: {students.length}
                </Badge>
              </div>
            )}
          </DialogHeader>
          <div className="space-y-6">
            {/* Form Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course">Course</Label>
                <Select 
                  value={attendanceForm.courseId} 
                  onValueChange={(value) => {
                    setAttendanceForm({...attendanceForm, courseId: value});
                    fetchStudentsForCourse(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.courseCode} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Select 
                  value={attendanceForm.subjectId} 
                  onValueChange={(value) => setAttendanceForm({...attendanceForm, subjectId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Subject</SelectItem>
                    {subjects.filter(subject => subject.courseId === attendanceForm.courseId).map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={attendanceForm.date}
                  onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={attendanceForm.semester} 
                  onValueChange={(value) => setAttendanceForm({...attendanceForm, semester: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                    <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                    <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={attendanceForm.year}
                  onChange={(e) => setAttendanceForm({...attendanceForm, year: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {students.length > 0 && (
              <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
                <Button
                  size="sm"
                  onClick={() => handleBulkMark('present')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark All Present
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkMark('absent')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Mark All Absent
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkMark('late')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Mark All Late
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkMark('excused')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Mark All Excused
                </Button>
              </div>
            )}

            {/* Students List */}
            {students.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Students ({students.length})</h3>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {students.map((student) => (
                    <div key={student._id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email} • {student.program}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <Label htmlFor={`status-${student._id}`}>Status</Label>
                          <Select
                            value={studentAttendance[student._id]?.status || 'absent'}
                            onValueChange={(value: any) => {
                              setStudentAttendance({
                                ...studentAttendance,
                                [student._id]: {
                                  ...studentAttendance[student._id],
                                  status: value
                                }
                              });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                              <SelectItem value="leave">Leave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {(studentAttendance[student._id]?.status === 'present' || studentAttendance[student._id]?.status === 'late') && (
                          <div>
                            <Label htmlFor={`checkin-${student._id}`}>Check-in Time</Label>
                            <Input
                              id={`checkin-${student._id}`}
                              type="time"
                              value={studentAttendance[student._id]?.checkInTime || ''}
                              onChange={(e) => {
                                setStudentAttendance({
                                  ...studentAttendance,
                                  [student._id]: {
                                    ...studentAttendance[student._id],
                                    checkInTime: e.target.value
                                  }
                                });
                              }}
                              className="w-32"
                            />
                          </div>
                        )}
                        {studentAttendance[student._id]?.status === 'excused' && (
                          <div>
                            <Label htmlFor={`excuse-${student._id}`}>Excuse Reason</Label>
                            <Input
                              id={`excuse-${student._id}`}
                              placeholder="Reason for absence"
                              value={studentAttendance[student._id]?.excuseReason || ''}
                              onChange={(e) => {
                                setStudentAttendance({
                                  ...studentAttendance,
                                  [student._id]: {
                                    ...studentAttendance[student._id],
                                    excuseReason: e.target.value
                                  }
                                });
                              }}
                              className="w-48"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">General Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={attendanceForm.notes}
                onChange={(e) => setAttendanceForm({...attendanceForm, notes: e.target.value})}
                placeholder="Additional notes for this attendance session..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkAttendanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMarkAttendance}
              disabled={!attendanceForm.courseId || students.length === 0}
            >
              Mark Attendance ({students.length} students)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Attendance Dialog */}
      <Dialog open={isViewAttendanceDialogOpen} onOpenChange={setIsViewAttendanceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>View detailed attendance information</DialogDescription>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Student Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedAttendance.studentId.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedAttendance.studentId.email}</p>
                    <p><span className="font-medium">Program:</span> {selectedAttendance.studentId.program}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Course Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Code:</span> {selectedAttendance.courseId.courseCode}</p>
                    <p><span className="font-medium">Title:</span> {selectedAttendance.courseId.title}</p>
                    <p><span className="font-medium">Department:</span> {selectedAttendance.courseId.department}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Attendance Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedAttendance.status)}`}>
                        {selectedAttendance.status.charAt(0).toUpperCase() + selectedAttendance.status.slice(1)}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedAttendance.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Semester:</span> {selectedAttendance.semester}</p>
                    <p><span className="font-medium">Year:</span> {selectedAttendance.year}</p>
                    {selectedAttendance.checkInTime && (
                      <p><span className="font-medium">Check-in:</span> {new Date(selectedAttendance.checkInTime).toLocaleTimeString()}</p>
                    )}
                    {selectedAttendance.isLate && (
                      <p><span className="font-medium">Late by:</span> {selectedAttendance.lateMinutes} minutes</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Administrative Info</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Marked By:</span> {selectedAttendance.markedBy.name}</p>
                    <p><span className="font-medium">Marked At:</span> {new Date(selectedAttendance.markedAt).toLocaleString()}</p>
                    {selectedAttendance.notes && (
                      <p><span className="font-medium">Notes:</span> {selectedAttendance.notes}</p>
                    )}
                    {selectedAttendance.excuseReason && (
                      <p><span className="font-medium">Excuse Reason:</span> {selectedAttendance.excuseReason}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewAttendanceDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceManagement;
