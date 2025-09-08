import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  GraduationCap,
  Eye,
  Edit
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
}

const StudentEnrollment: React.FC = () => {
  const { toast } = useToast();
  const { token, user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
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

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    courseId: '',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEnrollments(),
        fetchStudents(),
        fetchCourses()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const queryParams = new URLSearchParams({
        limit: '50',
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
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
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
          description: "Student enrollment request submitted successfully",
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
      case 'dropped': return <AlertCircle className="h-4 w-4" />;
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
          <h2 className="text-3xl font-bold text-gray-900">Student Enrollment</h2>
          <p className="text-gray-600">Enroll students in courses and manage enrollments</p>
        </div>
        <Button
          onClick={() => setIsEnrollDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Enroll Student
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Enrollments</CardTitle>
          <CardDescription>Manage student enrollments in your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">{enrollment.studentId.name}</h3>
                      <Badge className={`${getStatusColor(enrollment.status)} flex items-center gap-1`}>
                        {getStatusIcon(enrollment.status)}
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><span className="font-medium">Course:</span> {enrollment.courseId.courseCode} - {enrollment.courseId.title}</p>
                        <p><span className="font-medium">Email:</span> {enrollment.studentId.email}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Program:</span> {enrollment.studentId.program}</p>
                        <p><span className="font-medium">Semester:</span> {enrollment.semester} {enrollment.year}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Enrolled:</span> {new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
                        {enrollment.grade && <p><span className="font-medium">Grade:</span> {enrollment.grade}</p>}
                      </div>
                    </div>
                  </div>
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
                  </div>
                </div>
              </div>
            ))}
            {enrollments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No enrollments found</p>
              </div>
            )}
          </div>
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

export default StudentEnrollment;
