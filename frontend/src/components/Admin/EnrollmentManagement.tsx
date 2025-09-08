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
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  program: string;
  role: string;
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

interface Enrollment {
  _id: string;
  studentId: Student;
  courseId: Course;
  status: 'pending' | 'enrolled' | 'dropped' | 'completed' | 'suspended';
  semester: string;
  year: number;
  enrollmentDate: string;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  enrolledBy: {
    _id: string;
    name: string;
    email: string;
  };
  grade?: string;
  notes?: string;
  dropReason?: string;
}

interface EnrollmentStats {
  totalEnrollments: number;
  totalStudents: number;
  totalCourses: number;
  statusCounts: {
    pending: number;
    enrolled: number;
    dropped: number;
    completed: number;
    suspended: number;
  };
}

const EnrollmentManagement: React.FC = () => {
  const { toast } = useToast();
  const { token, user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isBulkEnrollDialogOpen, setIsBulkEnrollDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Form states
  const [enrollFormData, setEnrollFormData] = useState({
    studentId: '',
    courseId: '',
    semester: 'Fall 2024',
    year: 2024,
    notes: ''
  });

  const [bulkEnrollData, setBulkEnrollData] = useState({
    courseId: '',
    semester: 'Fall 2024',
    year: 2024,
    studentIds: [] as string[],
    notes: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    courseId: '',
    semester: '',
    year: '',
    search: ''
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
        fetchEnrollments(),
        fetchStudents(),
        fetchCourses(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_BASE_URL}/enrollments?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.data.enrollments);
        setTotalPages(data.data.pagination.pages);
      } else {
        throw new Error('Failed to fetch enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Failed to fetch enrollments');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users?role=student`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/stats`, {
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

  const handleEnrollStudent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollFormData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Student enrolled successfully",
        });
        setIsEnrollDialogOpen(false);
        setEnrollFormData({
          studentId: '',
          courseId: '',
          semester: 'Fall 2024',
          year: 2024,
          notes: ''
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enroll student');
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enroll student",
        variant: "destructive",
      });
    }
  };

  const handleBulkEnroll = async () => {
    try {
      const enrollments = bulkEnrollData.studentIds.map(studentId => ({
        studentId,
        courseId: bulkEnrollData.courseId,
        semester: bulkEnrollData.semester,
        year: bulkEnrollData.year,
        notes: bulkEnrollData.notes
      }));

      const response = await fetch(`${API_BASE_URL}/enrollments/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollments }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Bulk Enrollment Complete",
          description: `${data.data.successful} successful, ${data.data.failed} failed`,
        });
        setIsBulkEnrollDialogOpen(false);
        setBulkEnrollData({
          courseId: '',
          semester: 'Fall 2024',
          year: 2024,
          studentIds: [],
          notes: ''
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to bulk enroll students');
      }
    } catch (error) {
      console.error('Error bulk enrolling students:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to bulk enroll students",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEnrollment = async (enrollmentId: string, status: string, grade?: string, notes?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, grade, notes }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Enrollment updated successfully",
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update enrollment');
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update enrollment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dropped': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suspended': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enrolled': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'dropped': return <XCircle className="h-4 w-4" />;
      case 'completed': return <GraduationCap className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Enrollment Management</h2>
          <p className="text-gray-600">Manage student enrollments and course administration</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsEnrollDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll Student
          </Button>
          <Button
            onClick={() => setIsBulkEnrollDialogOpen(true)}
            variant="outline"
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk Enroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.statusCounts.enrolled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.statusCounts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="course-filter">Course</Label>
              <Select value={filters.courseId} onValueChange={(value) => setFilters({...filters, courseId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseCode} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="semester-filter">Semester</Label>
              <Select value={filters.semester} onValueChange={(value) => setFilters({...filters, semester: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Semesters</SelectItem>
                  <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                  <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                  <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year-filter">Year</Label>
              <Select value={filters.year} onValueChange={(value) => setFilters({...filters, year: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
          <CardDescription>Manage student enrollments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Course</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Semester</th>
                  <th className="text-left p-4">Enrolled By</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{enrollment.studentId.name}</p>
                        <p className="text-sm text-gray-600">{enrollment.studentId.email}</p>
                        <p className="text-xs text-gray-500">{enrollment.studentId.program}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{enrollment.courseId.courseCode}</p>
                        <p className="text-sm text-gray-600">{enrollment.courseId.title}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(enrollment.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(enrollment.status)}
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{enrollment.semester}</p>
                        <p className="text-sm text-gray-600">{enrollment.year}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{enrollment.enrolledBy.name}</p>
                        <p className="text-sm text-gray-600">{enrollment.enrolledBy.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {enrollment.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateEnrollment(enrollment._id, 'enrolled')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {enrollment.status === 'enrolled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateEnrollment(enrollment._id, 'dropped')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enroll Student Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>Add a student to a course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select value={enrollFormData.studentId} onValueChange={(value) => setEnrollFormData({...enrollFormData, studentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="course">Course</Label>
              <Select value={enrollFormData.courseId} onValueChange={(value) => setEnrollFormData({...enrollFormData, courseId: value})}>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select value={enrollFormData.semester} onValueChange={(value) => setEnrollFormData({...enrollFormData, semester: value})}>
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
                  value={enrollFormData.year}
                  onChange={(e) => setEnrollFormData({...enrollFormData, year: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={enrollFormData.notes}
                onChange={(e) => setEnrollFormData({...enrollFormData, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnrollStudent}>
              Enroll Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Enroll Dialog */}
      <Dialog open={isBulkEnrollDialogOpen} onOpenChange={setIsBulkEnrollDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Enroll Students</DialogTitle>
            <DialogDescription>Enroll multiple students in a course at once</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-course">Course</Label>
              <Select value={bulkEnrollData.courseId} onValueChange={(value) => setBulkEnrollData({...bulkEnrollData, courseId: value})}>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-semester">Semester</Label>
                <Select value={bulkEnrollData.semester} onValueChange={(value) => setBulkEnrollData({...bulkEnrollData, semester: value})}>
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
                <Label htmlFor="bulk-year">Year</Label>
                <Input
                  id="bulk-year"
                  type="number"
                  value={bulkEnrollData.year}
                  onChange={(e) => setBulkEnrollData({...bulkEnrollData, year: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label>Select Students</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-4">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center space-x-2 py-2">
                    <input
                      type="checkbox"
                      id={student._id}
                      checked={bulkEnrollData.studentIds.includes(student._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkEnrollData({
                            ...bulkEnrollData,
                            studentIds: [...bulkEnrollData.studentIds, student._id]
                          });
                        } else {
                          setBulkEnrollData({
                            ...bulkEnrollData,
                            studentIds: bulkEnrollData.studentIds.filter(id => id !== student._id)
                          });
                        }
                      }}
                    />
                    <label htmlFor={student._id} className="text-sm">
                      {student.name} ({student.email}) - {student.program}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="bulk-notes">Notes (Optional)</Label>
              <Textarea
                id="bulk-notes"
                value={bulkEnrollData.notes}
                onChange={(e) => setBulkEnrollData({...bulkEnrollData, notes: e.target.value})}
                placeholder="Additional notes for all enrollments..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkEnrollDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkEnroll}
              disabled={!bulkEnrollData.courseId || bulkEnrollData.studentIds.length === 0}
            >
              Enroll {bulkEnrollData.studentIds.length} Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Enrollment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogDescription>View detailed information about the enrollment</DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Student Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedEnrollment.studentId.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedEnrollment.studentId.email}</p>
                    <p><span className="font-medium">Program:</span> {selectedEnrollment.studentId.program}</p>
                    {selectedEnrollment.studentId.phone && (
                      <p><span className="font-medium">Phone:</span> {selectedEnrollment.studentId.phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Course Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Code:</span> {selectedEnrollment.courseId.courseCode}</p>
                    <p><span className="font-medium">Title:</span> {selectedEnrollment.courseId.title}</p>
                    <p><span className="font-medium">Department:</span> {selectedEnrollment.courseId.department}</p>
                    <p><span className="font-medium">Degree:</span> {selectedEnrollment.courseId.degree}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Enrollment Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedEnrollment.status)}`}>
                        {selectedEnrollment.status.charAt(0).toUpperCase() + selectedEnrollment.status.slice(1)}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Semester:</span> {selectedEnrollment.semester}</p>
                    <p><span className="font-medium">Year:</span> {selectedEnrollment.year}</p>
                    <p><span className="font-medium">Enrollment Date:</span> {new Date(selectedEnrollment.enrollmentDate).toLocaleDateString()}</p>
                    {selectedEnrollment.grade && (
                      <p><span className="font-medium">Grade:</span> {selectedEnrollment.grade}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Administrative Info</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Enrolled By:</span> {selectedEnrollment.enrolledBy.name}</p>
                    {selectedEnrollment.approvedBy && (
                      <p><span className="font-medium">Approved By:</span> {selectedEnrollment.approvedBy.name}</p>
                    )}
                    {selectedEnrollment.notes && (
                      <p><span className="font-medium">Notes:</span> {selectedEnrollment.notes}</p>
                    )}
                    {selectedEnrollment.dropReason && (
                      <p><span className="font-medium">Drop Reason:</span> {selectedEnrollment.dropReason}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrollmentManagement;
