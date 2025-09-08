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
  Award,
  Users,
  BookOpen,
  Upload,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Link,
  File,
  BarChart3,
  TrendingUp,
  Star,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  _id: string;
  title: string;
  description: string;
  objectives: string[];
  deliverables: string[];
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
  studentId: {
    _id: string;
    name: string;
    email: string;
    program: string;
    semester: string;
  };
  supervisorId?: {
    _id: string;
    name: string;
    email: string;
  };
  projectType: 'individual' | 'group';
  groupMembers?: Array<{
    studentId: string;
    name: string;
    email: string;
  }>;
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours?: number;
  budget?: number;
  resources: Array<{
    name: string;
    type: 'software' | 'hardware' | 'service' | 'other';
    cost?: number;
    description: string;
  }>;
  milestones: Array<{
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    completedDate?: string;
  }>;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: string;
  }>;
  evaluation?: {
    technicalScore: number;
    presentationScore: number;
    documentationScore: number;
    innovationScore: number;
    totalScore: number;
    feedback: string;
    evaluatedBy: string;
    evaluatedAt: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
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

interface ProjectStats {
  totalProjects: number;
  proposedProjects: number;
  approvedProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  averageCompletionTime: number;
  topPerformers: Array<{
    studentId: string;
    name: string;
    averageScore: number;
    projectsCompleted: number;
  }>;
  projectTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  upcomingDeadlines: Array<{
    projectId: string;
    title: string;
    milestone: string;
    dueDate: string;
    student: string;
  }>;
}

const ProjectsManagement: React.FC = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [projects, setProjects] = useState<Project[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
  const [isViewProjectDialogOpen, setIsViewProjectDialogOpen] = useState(false);
  const [isEvaluateProjectDialogOpen, setIsEvaluateProjectDialogOpen] = useState(false);
  const [isUploadGuidelinesDialogOpen, setIsUploadGuidelinesDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    courseId: '',
    subjectId: '',
    projectType: 'individual' as const,
    priority: 'medium' as const,
    startDate: '',
    endDate: '',
    estimatedHours: '',
    budget: '',
    objectives: [] as string[],
    deliverables: [] as string[]
  });

  const [evaluationForm, setEvaluationForm] = useState({
    technicalScore: '',
    presentationScore: '',
    documentationScore: '',
    innovationScore: '',
    feedback: ''
  });

  const [guidelinesFile, setGuidelinesFile] = useState<File | null>(null);
  const [newObjective, setNewObjective] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    courseId: '',
    subjectId: '',
    projectType: '',
    status: '',
    priority: '',
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
        fetchProjects(),
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

  const fetchProjects = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_BASE_URL}/projects?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data.projects);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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
      const response = await fetch(`${API_BASE_URL}/projects/stats`, {
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

  const handleApproveProject = async (projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project approved successfully",
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve project');
      }
    } catch (error) {
      console.error('Error approving project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve project",
        variant: "destructive",
      });
    }
  };

  const handleRejectProject = async (projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project rejected successfully",
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject project');
      }
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject project",
        variant: "destructive",
      });
    }
  };

  const handleEvaluateProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject._id}/evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technicalScore: parseFloat(evaluationForm.technicalScore),
          presentationScore: parseFloat(evaluationForm.presentationScore),
          documentationScore: parseFloat(evaluationForm.documentationScore),
          innovationScore: parseFloat(evaluationForm.innovationScore),
          feedback: evaluationForm.feedback
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project evaluated successfully",
        });
        setIsEvaluateProjectDialogOpen(false);
        setEvaluationForm({
          technicalScore: '',
          presentationScore: '',
          documentationScore: '',
          innovationScore: '',
          feedback: ''
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to evaluate project');
      }
    } catch (error) {
      console.error('Error evaluating project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to evaluate project",
        variant: "destructive",
      });
    }
  };

  const handleUploadGuidelines = async () => {
    if (!guidelinesFile) return;

    try {
      const formData = new FormData();
      formData.append('file', guidelinesFile);
      formData.append('type', 'project_guidelines');

      const response = await fetch(`${API_BASE_URL}/projects/upload-guidelines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project guidelines uploaded successfully",
        });
        setIsUploadGuidelinesDialogOpen(false);
        setGuidelinesFile(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload guidelines');
      }
    } catch (error) {
      console.error('Error uploading guidelines:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload guidelines",
        variant: "destructive",
      });
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setProjectForm({
        ...projectForm,
        objectives: [...projectForm.objectives, newObjective.trim()]
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setProjectForm({
      ...projectForm,
      objectives: projectForm.objectives.filter((_, i) => i !== index)
    });
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setProjectForm({
        ...projectForm,
        deliverables: [...projectForm.deliverables, newDeliverable.trim()]
      });
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setProjectForm({
      ...projectForm,
      deliverables: projectForm.deliverables.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-blue-100 text-blue-800';
      case 'group': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
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
          <h2 className="text-3xl font-bold text-gray-900">Projects Management</h2>
          <p className="text-gray-600">Manage student projects, approve proposals, and evaluate submissions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsUploadGuidelinesDialogOpen(true)}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Guidelines
          </Button>
          <Button
            onClick={() => setIsCreateProjectDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgressProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
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
            <CardTitle>Upcoming Milestone Deadlines</CardTitle>
            <CardDescription>Projects with approaching milestone deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingDeadlines.map((deadline) => (
                <div key={deadline.projectId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-orange-100">
                      <Target className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{deadline.title}</h3>
                      <p className="text-sm text-gray-600">{deadline.milestone}</p>
                      <p className="text-xs text-gray-500">Student: {deadline.student}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(deadline.dueDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">
                      {Math.ceil((new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                    </p>
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
              <Label htmlFor="type-filter">Type</Label>
              <Select value={filters.projectType} onValueChange={(value) => setFilters({...filters, projectType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
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
                  <SelectItem value="proposed">Proposed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>View and manage all student projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Project</th>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Course</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Progress</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getPriorityColor(project.priority)} text-xs`}>
                            {project.priority}
                          </Badge>
                          {project.budget && (
                            <span className="text-xs text-gray-500">
                              Budget: ${project.budget}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{project.studentId.name}</p>
                        <p className="text-sm text-gray-600">{project.studentId.email}</p>
                        <p className="text-xs text-gray-500">{project.studentId.program}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{project.courseId.courseCode}</p>
                        <p className="text-sm text-gray-600">{project.courseId.title}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getProjectTypeColor(project.projectType)} capitalize`}>
                        {project.projectType}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(project.status)} capitalize`}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Progress 
                            value={(project.milestones.filter(m => m.status === 'completed').length / project.milestones.length) * 100} 
                            className="w-16 h-2" 
                          />
                          <span className="text-xs text-gray-500">
                            {project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {project.actualHours ? `${project.actualHours}/${project.estimatedHours}h` : `${project.estimatedHours}h estimated`}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsViewProjectDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {project.status === 'proposed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleApproveProject(project._id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleRejectProject(project._id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {project.status === 'completed' && !project.evaluation && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProject(project);
                              setIsEvaluateProjectDialogOpen(true);
                            }}
                          >
                            <Star className="h-4 w-4" />
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

      {/* View Project Dialog */}
      <Dialog open={isViewProjectDialogOpen} onOpenChange={setIsViewProjectDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>View detailed project information</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Project Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Title:</span> {selectedProject.title}</p>
                    <p><span className="font-medium">Type:</span> 
                      <Badge className={`ml-2 ${getProjectTypeColor(selectedProject.projectType)}`}>
                        {selectedProject.projectType}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status.replace('_', ' ')}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Priority:</span> 
                      <Badge className={`ml-2 ${getPriorityColor(selectedProject.priority)}`}>
                        {selectedProject.priority}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Duration:</span> {new Date(selectedProject.startDate).toLocaleDateString()} - {new Date(selectedProject.endDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Estimated Hours:</span> {selectedProject.estimatedHours}</p>
                    {selectedProject.actualHours && (
                      <p><span className="font-medium">Actual Hours:</span> {selectedProject.actualHours}</p>
                    )}
                    {selectedProject.budget && (
                      <p><span className="font-medium">Budget:</span> ${selectedProject.budget}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Student Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedProject.studentId.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedProject.studentId.email}</p>
                    <p><span className="font-medium">Program:</span> {selectedProject.studentId.program}</p>
                    <p><span className="font-medium">Semester:</span> {selectedProject.studentId.semester}</p>
                    {selectedProject.supervisorId && (
                      <>
                        <p><span className="font-medium">Supervisor:</span> {selectedProject.supervisorId.name}</p>
                        <p><span className="font-medium">Supervisor Email:</span> {selectedProject.supervisorId.email}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-gray-700">{selectedProject.description}</p>
              </div>

              {selectedProject.objectives.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Objectives</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedProject.objectives.map((objective, index) => (
                      <li key={index} className="text-gray-700">{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProject.deliverables.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Deliverables</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedProject.deliverables.map((deliverable, index) => (
                      <li key={index} className="text-gray-700">{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProject.milestones.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Milestones</h3>
                  <div className="space-y-3">
                    {selectedProject.milestones.map((milestone, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <Badge className={`${getMilestoneStatusColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          {milestone.completedDate && (
                            <span>Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.resources.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Resources</h3>
                  <div className="space-y-2">
                    {selectedProject.resources.map((resource, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{resource.name}</p>
                            <p className="text-sm text-gray-600">{resource.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{resource.type}</Badge>
                            {resource.cost && (
                              <p className="text-sm text-gray-500">${resource.cost}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedProject.attachments.map((attachment, index) => (
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

              {selectedProject.evaluation && (
                <div>
                  <h3 className="font-semibold mb-3">Evaluation</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                      <p><span className="font-medium">Technical Score:</span> {selectedProject.evaluation.technicalScore}/10</p>
                      <p><span className="font-medium">Presentation Score:</span> {selectedProject.evaluation.presentationScore}/10</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Documentation Score:</span> {selectedProject.evaluation.documentationScore}/10</p>
                      <p><span className="font-medium">Innovation Score:</span> {selectedProject.evaluation.innovationScore}/10</p>
                    </div>
                    <div className="col-span-2">
                      <p><span className="font-medium">Total Score:</span> {selectedProject.evaluation.totalScore}/40</p>
                      <p><span className="font-medium">Feedback:</span> {selectedProject.evaluation.feedback}</p>
                      <p className="text-sm text-gray-500">
                        Evaluated by: {selectedProject.evaluation.evaluatedBy} on {new Date(selectedProject.evaluation.evaluatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewProjectDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evaluate Project Dialog */}
      <Dialog open={isEvaluateProjectDialogOpen} onOpenChange={setIsEvaluateProjectDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evaluate Project</DialogTitle>
            <DialogDescription>Provide evaluation scores and feedback</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="technical-score">Technical Score (0-10)</Label>
                <Input
                  id="technical-score"
                  type="number"
                  min="0"
                  max="10"
                  value={evaluationForm.technicalScore}
                  onChange={(e) => setEvaluationForm({...evaluationForm, technicalScore: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="presentation-score">Presentation Score (0-10)</Label>
                <Input
                  id="presentation-score"
                  type="number"
                  min="0"
                  max="10"
                  value={evaluationForm.presentationScore}
                  onChange={(e) => setEvaluationForm({...evaluationForm, presentationScore: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentation-score">Documentation Score (0-10)</Label>
                <Input
                  id="documentation-score"
                  type="number"
                  min="0"
                  max="10"
                  value={evaluationForm.documentationScore}
                  onChange={(e) => setEvaluationForm({...evaluationForm, documentationScore: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="innovation-score">Innovation Score (0-10)</Label>
                <Input
                  id="innovation-score"
                  type="number"
                  min="0"
                  max="10"
                  value={evaluationForm.innovationScore}
                  onChange={(e) => setEvaluationForm({...evaluationForm, innovationScore: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={evaluationForm.feedback}
                onChange={(e) => setEvaluationForm({...evaluationForm, feedback: e.target.value})}
                placeholder="Provide detailed feedback..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEvaluateProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEvaluateProject}>
              Submit Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Guidelines Dialog */}
      <Dialog open={isUploadGuidelinesDialogOpen} onOpenChange={setIsUploadGuidelinesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Project Guidelines</DialogTitle>
            <DialogDescription>Upload project guidelines and templates</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">Upload guidelines file</p>
              <p className="text-xs text-gray-500">Supported formats: .pdf, .doc, .docx</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setGuidelinesFile(file);
                  }
                }}
                className="mt-4"
              />
            </div>
            {guidelinesFile && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{guidelinesFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(guidelinesFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadGuidelinesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadGuidelines} disabled={!guidelinesFile}>
              Upload Guidelines
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsManagement;
