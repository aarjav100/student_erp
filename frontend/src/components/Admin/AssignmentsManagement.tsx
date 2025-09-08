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
import { Progress } from '@/components/ui/progress';
import { 
  FileText,
  Upload,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Link,
  File,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  courseId: {
    _id: string;
    title: string;
    courseCode: string;
    department: string;
  };
  subjectId?: {
    _id: string;
    name: string;
    code: string;
  };
  assignmentType: 'homework' | 'project' | 'quiz' | 'exam' | 'lab' | 'presentation';
  dueDate: string;
  totalMarks: number;
  instructions: string;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  links: Array<{
    title: string;
    url: string;
  }>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  status: 'draft' | 'published' | 'closed';
  submissions: Array<{
    studentId: string;
    studentName: string;
    submittedAt: string;
    status: 'submitted' | 'graded' | 'late';
    marksObtained?: number;
  }>;
  totalSubmissions: number;
  gradedSubmissions: number;
}

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  department: string;
  degree: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  courseId: string;
}

interface AssignmentStats {
  totalAssignments: number;
  publishedAssignments: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageSubmissionRate: number;
  upcomingDeadlines: Array<{
    assignmentId: string;
    title: string;
    dueDate: string;
    course: string;
    submissionsLeft: number;
  }>;
}

const AssignmentsManagement: React.FC = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isCreateAssignmentDialogOpen, setIsCreateAssignmentDialogOpen] = useState(false);
  const [isViewAssignmentDialogOpen, setIsViewAssignmentDialogOpen] = useState(false);
  const [isEditAssignmentDialogOpen, setIsEditAssignmentDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    courseId: '',
    subjectId: '',
    assignmentType: 'homework' as const,
    dueDate: '',
    totalMarks: '',
    instructions: '',
    links: [] as Array<{title: string, url: string}>,
    status: 'draft' as const
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  // Filter states
  const [filters, setFilters] = useState({
    courseId: '',
    subjectId: '',
    assignmentType: '',
    status: '',
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
        fetchAssignments(),
        fetchCourses(),
        fetchSubjects(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_BASE_URL}/assignments?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.data.assignments);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
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

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/stats`, {
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

  const handleCreateAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append('title', assignmentForm.title);
      formData.append('description', assignmentForm.description);
      formData.append('courseId', assignmentForm.courseId);
      formData.append('subjectId', assignmentForm.subjectId);
      formData.append('assignmentType', assignmentForm.assignmentType);
      formData.append('dueDate', assignmentForm.dueDate);
      formData.append('totalMarks', assignmentForm.totalMarks);
      formData.append('instructions', assignmentForm.instructions);
      formData.append('links', JSON.stringify(assignmentForm.links));
      formData.append('status', assignmentForm.status);

      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assignment created successfully",
        });
        setIsCreateAssignmentDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setAssignmentForm({
      title: '',
      description: '',
      courseId: '',
      subjectId: '',
      assignmentType: 'homework',
      dueDate: '',
      totalMarks: '',
      instructions: '',
      links: [],
      status: 'draft'
    });
    setAttachments([]);
    setNewLink({ title: '', url: '' });
  };

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setAssignmentForm({
        ...assignmentForm,
        links: [...assignmentForm.links, newLink]
      });
      setNewLink({ title: '', url: '' });
    }
  };

  const removeLink = (index: number) => {
    setAssignmentForm({
      ...assignmentForm,
      links: assignmentForm.links.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'homework': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'quiz': return 'bg-green-100 text-green-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'lab': return 'bg-orange-100 text-orange-800';
      case 'presentation': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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
          <h2 className="text-3xl font-bold text-gray-900">Assignments Management</h2>
          <p className="text-gray-600">Create and manage assignments, track submissions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateAssignmentDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.publishedAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Submission Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageSubmissionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming Deadlines */}
      {stats?.upcomingDeadlines && stats.upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Assignments with approaching deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingDeadlines.map((deadline) => (
                <div key={deadline.assignmentId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{deadline.title}</h3>
                      <p className="text-sm text-gray-600">{deadline.course}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(deadline.dueDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{deadline.submissionsLeft} submissions left</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Label htmlFor="type-filter">Type</Label>
              <Select value={filters.assignmentType} onValueChange={(value) => setFilters({...filters, assignmentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search assignments..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>View and manage all assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">Course</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Due Date</th>
                  <th className="text-left p-4">Submissions</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {assignment.description}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{assignment.courseId.courseCode}</p>
                        <p className="text-sm text-gray-600">{assignment.courseId.title}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getAssignmentTypeColor(assignment.assignmentType)} capitalize`}>
                        {assignment.assignmentType}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                          {isOverdue(assignment.dueDate) && (
                            <p className="text-xs text-red-600">Overdue</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{assignment.totalSubmissions}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={(assignment.gradedSubmissions / assignment.totalSubmissions) * 100} 
                            className="w-16 h-2" 
                          />
                          <span className="text-xs text-gray-500">
                            {assignment.gradedSubmissions} graded
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(assignment.status)} capitalize`}>
                        {assignment.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setIsViewAssignmentDialogOpen(true);
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

      {/* Create Assignment Dialog */}
      <Dialog open={isCreateAssignmentDialogOpen} onOpenChange={setIsCreateAssignmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>Create a new assignment for students</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                  placeholder="Enter assignment title"
                />
              </div>
              <div>
                <Label htmlFor="type">Assignment Type</Label>
                <Select value={assignmentForm.assignmentType} onValueChange={(value: any) => setAssignmentForm({...assignmentForm, assignmentType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homework">Homework</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                placeholder="Enter assignment description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course">Course</Label>
                <Select value={assignmentForm.courseId} onValueChange={(value) => setAssignmentForm({...assignmentForm, courseId: value})}>
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
                <Select value={assignmentForm.subjectId} onValueChange={(value) => setAssignmentForm({...assignmentForm, subjectId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Subject</SelectItem>
                    {subjects.filter(subject => subject.courseId === assignmentForm.courseId).map((subject) => (
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
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="total-marks">Total Marks</Label>
                <Input
                  id="total-marks"
                  type="number"
                  value={assignmentForm.totalMarks}
                  onChange={(e) => setAssignmentForm({...assignmentForm, totalMarks: e.target.value})}
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={assignmentForm.instructions}
                onChange={(e) => setAssignmentForm({...assignmentForm, instructions: e.target.value})}
                placeholder="Enter detailed instructions for students"
                rows={4}
              />
            </div>

            {/* File Attachments */}
            <div>
              <Label htmlFor="attachments">File Attachments</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setAttachments(files);
                }}
                className="mt-1"
              />
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <File className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div>
              <Label>External Links</Label>
              <div className="space-y-2">
                {assignmentForm.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Link className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{link.title}</span>
                    <span className="text-xs text-gray-500">{link.url}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeLink(index)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Link title"
                    value={newLink.title}
                    onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  />
                  <Input
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  />
                  <Button onClick={addLink} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={assignmentForm.status} onValueChange={(value: any) => setAssignmentForm({...assignmentForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateAssignmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAssignment}>
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignment Dialog */}
      <Dialog open={isViewAssignmentDialogOpen} onOpenChange={setIsViewAssignmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>View assignment information and submissions</DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Assignment Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Title:</span> {selectedAssignment.title}</p>
                    <p><span className="font-medium">Type:</span> 
                      <Badge className={`ml-2 ${getAssignmentTypeColor(selectedAssignment.assignmentType)}`}>
                        {selectedAssignment.assignmentType}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Course:</span> {selectedAssignment.courseId.courseCode} - {selectedAssignment.courseId.title}</p>
                    {selectedAssignment.subjectId && (
                      <p><span className="font-medium">Subject:</span> {selectedAssignment.subjectId.code} - {selectedAssignment.subjectId.name}</p>
                    )}
                    <p><span className="font-medium">Due Date:</span> {new Date(selectedAssignment.dueDate).toLocaleString()}</p>
                    <p><span className="font-medium">Total Marks:</span> {selectedAssignment.totalMarks}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedAssignment.status)}`}>
                        {selectedAssignment.status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Submission Statistics</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Total Submissions:</span> {selectedAssignment.totalSubmissions}</p>
                    <p><span className="font-medium">Graded Submissions:</span> {selectedAssignment.gradedSubmissions}</p>
                    <div className="mt-4">
                      <Progress 
                        value={(selectedAssignment.gradedSubmissions / selectedAssignment.totalSubmissions) * 100} 
                        className="h-2" 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {((selectedAssignment.gradedSubmissions / selectedAssignment.totalSubmissions) * 100).toFixed(1)}% graded
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-gray-700">{selectedAssignment.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Instructions</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignment.instructions}</p>
              </div>

              {selectedAssignment.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedAssignment.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <File className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{attachment.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <Button size="sm" variant="outline" className="ml-auto">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAssignment.links.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">External Links</h3>
                  <div className="space-y-2">
                    {selectedAssignment.links.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <Link className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{link.title}</span>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {link.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAssignment.submissions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recent Submissions</h3>
                  <div className="space-y-2">
                    {selectedAssignment.submissions.slice(0, 5).map((submission, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{submission.studentName}</p>
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                            submission.status === 'late' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {submission.status}
                          </Badge>
                          {submission.marksObtained && (
                            <span className="text-sm font-medium">
                              {submission.marksObtained}/{selectedAssignment.totalMarks}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewAssignmentDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsManagement;
