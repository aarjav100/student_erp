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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award,
  Users,
  BookOpen,
  Upload,
  Download,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  _id: string;
  name: string;
  email: string;
  program: string;
  semester: string;
  year: number;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  courseId: string;
  credits: number;
}

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  department: string;
  degree: string;
}

interface Grade {
  _id: string;
  studentId: Student;
  subjectId: Subject;
  courseId: Course;
  assignmentType: 'quiz' | 'assignment' | 'midterm' | 'final' | 'project' | 'lab';
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  semester: string;
  year: number;
  submittedBy: {
    _id: string;
    name: string;
    email: string;
  };
  submittedAt: string;
  remarks?: string;
}

interface GradeStats {
  totalStudents: number;
  averageGrade: number;
  gradeDistribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
  topPerformers: Array<{
    studentId: string;
    name: string;
    averageGrade: number;
  }>;
}

const GradesManagement: React.FC = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [stats, setStats] = useState<GradeStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isAddGradeDialogOpen, setIsAddGradeDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isViewGradeDialogOpen, setIsViewGradeDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  // Form states
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    subjectId: '',
    courseId: '',
    assignmentType: 'quiz' as const,
    marksObtained: '',
    totalMarks: '',
    semester: 'Fall 2024',
    year: 2024,
    remarks: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    courseId: '',
    subjectId: '',
    studentId: '',
    assignmentType: '',
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
        fetchStudents(),
        fetchSubjects(),
        fetchCourses(),
        fetchGrades(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const fetchGrades = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_BASE_URL}/grades?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGrades(data.data.grades);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/grades/stats`, {
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

  const handleAddGrade = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/grades`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gradeForm,
          marksObtained: parseFloat(gradeForm.marksObtained),
          totalMarks: parseFloat(gradeForm.totalMarks)
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Grade added successfully",
        });
        setIsAddGradeDialogOpen(false);
        setGradeForm({
          studentId: '',
          subjectId: '',
          courseId: '',
          assignmentType: 'quiz',
          marksObtained: '',
          totalMarks: '',
          semester: 'Fall 2024',
          year: 2024,
          remarks: ''
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add grade');
      }
    } catch (error) {
      console.error('Error adding grade:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add grade",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/grades/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Bulk Upload Complete",
          description: `${data.data.successful} grades uploaded, ${data.data.failed} failed`,
        });
        setIsBulkUploadDialogOpen(false);
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload grades');
      }
    } catch (error) {
      console.error('Error uploading grades:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload grades",
        variant: "destructive",
      });
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B+':
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C+':
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D+':
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'midterm': return 'bg-purple-100 text-purple-800';
      case 'final': return 'bg-red-100 text-red-800';
      case 'project': return 'bg-yellow-100 text-yellow-800';
      case 'lab': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h2 className="text-3xl font-bold text-gray-900">Grades Management</h2>
          <p className="text-gray-600">Manage student grades and academic performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsBulkUploadDialogOpen(true)}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button
            onClick={() => setIsAddGradeDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Grade
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageGrade}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Performers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.topPerformers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Grade Distribution</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.gradeDistribution.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
              <Label htmlFor="subject-filter">Subject</Label>
              <Select value={filters.subjectId} onValueChange={(value) => setFilters({...filters, subjectId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="student-filter">Student</Label>
              <Select value={filters.studentId} onValueChange={(value) => setFilters({...filters, studentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Assignment Type</Label>
              <Select value={filters.assignmentType} onValueChange={(value) => setFilters({...filters, assignmentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grades</CardTitle>
          <CardDescription>View and manage all student grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Subject</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Marks</th>
                  <th className="text-left p-4">Grade</th>
                  <th className="text-left p-4">Semester</th>
                  <th className="text-left p-4">Submitted</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{grade.studentId.name}</p>
                        <p className="text-sm text-gray-600">{grade.studentId.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{grade.subjectId.code}</p>
                        <p className="text-sm text-gray-600">{grade.subjectId.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getAssignmentTypeColor(grade.assignmentType)} capitalize`}>
                        {grade.assignmentType}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{grade.marksObtained}/{grade.totalMarks}</p>
                        <p className="text-sm text-gray-600">{grade.percentage.toFixed(1)}%</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getGradeColor(grade.grade)} font-semibold`}>
                        {grade.grade}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{grade.semester}</p>
                        <p className="text-sm text-gray-600">{grade.year}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{grade.submittedBy.name}</p>
                        <p className="text-sm text-gray-600">{new Date(grade.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedGrade(grade);
                            setIsViewGradeDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {/* Add Grade Dialog */}
      <Dialog open={isAddGradeDialogOpen} onOpenChange={setIsAddGradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Grade</DialogTitle>
            <DialogDescription>Enter grade information for a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student">Student</Label>
                <Select value={gradeForm.studentId} onValueChange={(value) => setGradeForm({...gradeForm, studentId: value})}>
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
                <Label htmlFor="subject">Subject</Label>
                <Select value={gradeForm.subjectId} onValueChange={(value) => setGradeForm({...gradeForm, subjectId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course">Course</Label>
                <Select value={gradeForm.courseId} onValueChange={(value) => setGradeForm({...gradeForm, courseId: value})}>
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
                <Label htmlFor="type">Assignment Type</Label>
                <Select value={gradeForm.assignmentType} onValueChange={(value: any) => setGradeForm({...gradeForm, assignmentType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="marks-obtained">Marks Obtained</Label>
                <Input
                  id="marks-obtained"
                  type="number"
                  value={gradeForm.marksObtained}
                  onChange={(e) => setGradeForm({...gradeForm, marksObtained: e.target.value})}
                  placeholder="85"
                />
              </div>
              <div>
                <Label htmlFor="total-marks">Total Marks</Label>
                <Input
                  id="total-marks"
                  type="number"
                  value={gradeForm.totalMarks}
                  onChange={(e) => setGradeForm({...gradeForm, totalMarks: e.target.value})}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={gradeForm.year}
                  onChange={(e) => setGradeForm({...gradeForm, year: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select value={gradeForm.semester} onValueChange={(value) => setGradeForm({...gradeForm, semester: value})}>
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
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={gradeForm.remarks}
                onChange={(e) => setGradeForm({...gradeForm, remarks: e.target.value})}
                placeholder="Additional comments..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGrade}>
              Add Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Upload Grades</DialogTitle>
            <DialogDescription>Upload grades from CSV or Excel file</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">Upload CSV or Excel file</p>
              <p className="text-xs text-gray-500">Supported formats: .csv, .xlsx, .xls</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleBulkUpload(file);
                  }
                }}
                className="mt-4"
              />
            </div>
            <div className="text-xs text-gray-500">
              <p className="font-medium mb-2">Required columns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>student_email</li>
                <li>subject_code</li>
                <li>assignment_type</li>
                <li>marks_obtained</li>
                <li>total_marks</li>
                <li>semester</li>
                <li>year</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Grade Dialog */}
      <Dialog open={isViewGradeDialogOpen} onOpenChange={setIsViewGradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade Details</DialogTitle>
            <DialogDescription>View detailed grade information</DialogDescription>
          </DialogHeader>
          {selectedGrade && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Student Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedGrade.studentId.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedGrade.studentId.email}</p>
                    <p><span className="font-medium">Program:</span> {selectedGrade.studentId.program}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Subject Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Code:</span> {selectedGrade.subjectId.code}</p>
                    <p><span className="font-medium">Name:</span> {selectedGrade.subjectId.name}</p>
                    <p><span className="font-medium">Credits:</span> {selectedGrade.subjectId.credits}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Grade Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Type:</span> 
                      <Badge className={`ml-2 ${getAssignmentTypeColor(selectedGrade.assignmentType)}`}>
                        {selectedGrade.assignmentType}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Marks:</span> {selectedGrade.marksObtained}/{selectedGrade.totalMarks}</p>
                    <p><span className="font-medium">Percentage:</span> {selectedGrade.percentage.toFixed(1)}%</p>
                    <p><span className="font-medium">Grade:</span> 
                      <Badge className={`ml-2 ${getGradeColor(selectedGrade.grade)}`}>
                        {selectedGrade.grade}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Academic Info</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Semester:</span> {selectedGrade.semester}</p>
                    <p><span className="font-medium">Year:</span> {selectedGrade.year}</p>
                    <p><span className="font-medium">Submitted By:</span> {selectedGrade.submittedBy.name}</p>
                    <p><span className="font-medium">Submitted At:</span> {new Date(selectedGrade.submittedAt).toLocaleString()}</p>
                    {selectedGrade.remarks && (
                      <p><span className="font-medium">Remarks:</span> {selectedGrade.remarks}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewGradeDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradesManagement;
