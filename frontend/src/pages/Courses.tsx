import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { 
  BookOpen, Clock, Users, Calendar, MapPin, FileText, Download, Upload, MessageSquare, 
  Star, Bookmark, Share2, Eye, Edit, Trash2, Plus, Search, Filter, SortAsc, SortDesc,
  Bell, CheckCircle, AlertCircle, XCircle, Mail, Phone, Video, Calendar as CalendarIcon,
  TrendingUp, Award, Target, BookmarkPlus, GraduationCap, Zap, Heart, ThumbsUp
} from 'lucide-react';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';

const Courses = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('courseCode');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', file: null });
  const [contactForm, setContactForm] = useState({ subject: '', message: '', type: 'email' });
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', file: null, category: 'notes' });
  
  // Dialog states
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showAvailableCoursesDialog, setShowAvailableCoursesDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme on component mount - default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      // Default to light mode
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  // Function to toggle theme
  const toggleTheme = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Enhanced course data with more realistic details
  const [courses, setCourses] = useState([
    {
      id: 1,
      courseCode: 'CS101',
      title: 'Introduction to Computer Science',
      description: 'Comprehensive introduction to programming concepts, algorithms, and computer science fundamentals including data structures and software development principles.',
      credits: 3,
      instructor: 'Dr. Sarah Smith',
      instructorEmail: 'sarah.smith@university.edu',
      instructorPhone: '+1 (555) 123-4567',
      schedule: 'MWF 10:00-11:15',
      room: 'Engineering Building - Room 101',
      enrolledStudents: 25,
      maxStudents: 30,
      status: 'enrolled',
      semester: 'Fall 2024',
      progress: 75,
      grade: 'A-',
      gradePoints: 3.7,
      attendance: 92,
      nextClass: '2024-12-15T10:00:00',
      officeHours: 'Tuesday 2:00-4:00 PM',
      favorited: true,
      difficulty: 'Intermediate',
      category: 'Computer Science',
      prerequisites: ['MATH100'],
      assignments: [
        { 
          id: 1, 
          title: 'Programming Assignment 1: Basic Algorithms', 
          dueDate: '2024-12-15', 
          status: 'submitted', 
          grade: 95,
          maxGrade: 100,
          submittedDate: '2024-12-14',
          feedback: 'Excellent work on algorithm implementation!'
        },
        { 
          id: 2, 
          title: 'Midterm Exam', 
          dueDate: '2024-12-20', 
          status: 'upcoming', 
          grade: null,
          maxGrade: 100,
          type: 'exam',
          duration: '2 hours'
        },
        { 
          id: 3, 
          title: 'Final Project: Web Application', 
          dueDate: '2024-12-30', 
          status: 'in-progress', 
          grade: null,
          maxGrade: 200,
          type: 'project',
          groupProject: true
        }
      ],
      materials: [
        { 
          id: 1, 
          title: 'Course Syllabus', 
          type: 'pdf', 
          size: '2.5 MB', 
          uploaded: '2024-09-01',
          category: 'syllabus',
          downloadCount: 156,
          url: '/materials/cs101-syllabus.pdf'
        },
        { 
          id: 2, 
          title: 'Lecture Notes - Week 1: Introduction', 
          type: 'pdf', 
          size: '1.8 MB', 
          uploaded: '2024-09-03',
          category: 'notes',
          downloadCount: 89,
          url: '/materials/cs101-week1.pdf'
        },
        { 
          id: 3, 
          title: 'Programming Exercises & Solutions', 
          type: 'zip', 
          size: '5.2 MB', 
          uploaded: '2024-09-05',
          category: 'exercises',
          downloadCount: 234,
          url: '/materials/cs101-exercises.zip'
        }
      ],
      announcements: [
        { 
          id: 1, 
          title: 'Office Hours Schedule Update', 
          content: 'Office hours have been moved to Tuesday 2-4 PM this week due to faculty meeting conflicts.', 
          date: '2024-12-10',
          priority: 'medium',
          read: false
        },
        { 
          id: 2, 
          title: 'Assignment Extension Granted', 
          content: 'Due to technical difficulties, Assignment 1 deadline has been extended by 2 days. New deadline: December 17th.', 
          date: '2024-12-08',
          priority: 'high',
          read: true
        }
      ],
      discussions: [
        { id: 1, title: 'Help with Assignment 1', replies: 8, lastActivity: '2024-12-12' },
        { id: 2, title: 'Study Group Formation', replies: 15, lastActivity: '2024-12-11' }
      ]
    },
    {
      id: 2,
      courseCode: 'MATH201',
      title: 'Calculus I',
      description: 'Comprehensive study of differential calculus including limits, derivatives, and their applications to optimization and related rate problems.',
      credits: 4,
      instructor: 'Dr. Michael Johnson',
      instructorEmail: 'michael.johnson@university.edu',
      instructorPhone: '+1 (555) 234-5678',
      schedule: 'TTh 14:00-15:30',
      room: 'Mathematics Building - Room 202',
      enrolledStudents: 20,
      maxStudents: 25,
      status: 'enrolled',
      semester: 'Fall 2024',
      progress: 60,
      grade: 'B+',
      gradePoints: 3.3,
      attendance: 88,
      nextClass: '2024-12-16T14:00:00',
      officeHours: 'Wednesday 1:00-3:00 PM',
      favorited: false,
      difficulty: 'Advanced',
      category: 'Mathematics',
      prerequisites: ['MATH120', 'MATH130'],
      assignments: [
        { 
          id: 1, 
          title: 'Homework Set 1: Limits and Continuity', 
          dueDate: '2024-12-12', 
          status: 'submitted', 
          grade: 88,
          maxGrade: 100,
          submittedDate: '2024-12-11',
          feedback: 'Good understanding of concepts, watch calculation errors.'
        },
        { 
          id: 2, 
          title: 'Midterm Examination', 
          dueDate: '2024-12-18', 
          status: 'submitted', 
          grade: 92,
          maxGrade: 100,
          type: 'exam',
          feedback: 'Excellent performance on derivatives!'
        },
        { 
          id: 3, 
          title: 'Final Examination', 
          dueDate: '2024-12-25', 
          status: 'upcoming', 
          grade: null,
          maxGrade: 100,
          type: 'exam',
          duration: '3 hours'
        }
      ],
      materials: [
        { 
          id: 1, 
          title: 'Calculus Textbook (Digital Edition)', 
          type: 'pdf', 
          size: '15.2 MB', 
          uploaded: '2024-09-01',
          category: 'textbook',
          downloadCount: 67,
          url: '/materials/calculus-textbook.pdf'
        },
        { 
          id: 2, 
          title: 'Practice Problems & Answer Key', 
          type: 'pdf', 
          size: '3.1 MB', 
          uploaded: '2024-09-02',
          category: 'exercises',
          downloadCount: 134,
          url: '/materials/calculus-practice.pdf'
        }
      ],
      announcements: [
        { 
          id: 1, 
          title: 'Extra Credit Opportunity Available', 
          content: 'Complete the bonus problem set for up to 5 extra credit points. Due December 20th.', 
          date: '2024-12-09',
          priority: 'low',
          read: true
        }
      ],
      discussions: [
        { id: 1, title: 'Derivative Rules Clarification', replies: 12, lastActivity: '2024-12-13' }
      ]
    },
    {
      id: 3,
      courseCode: 'ENG101',
      title: 'English Composition',
      description: 'Development of college-level writing skills including critical thinking, research methods, and academic writing conventions across various genres.',
      credits: 3,
      instructor: 'Prof. Emily Williams',
      instructorEmail: 'emily.williams@university.edu',
      instructorPhone: '+1 (555) 345-6789',
      schedule: 'MWF 13:00-14:15',
      room: 'Liberal Arts Building - Room 303',
      enrolledStudents: 18,
      maxStudents: 22,
      status: 'enrolled',
      semester: 'Fall 2024',
      progress: 85,
      grade: 'A',
      gradePoints: 4.0,
      attendance: 96,
      nextClass: '2024-12-16T13:00:00',
      officeHours: 'Friday 10:00-12:00 PM',
      favorited: true,
      difficulty: 'Intermediate',
      category: 'English',
      prerequisites: [],
      assignments: [
        { 
          id: 1, 
          title: 'Argumentative Essay: Technology Impact', 
          dueDate: '2024-12-10', 
          status: 'submitted', 
          grade: 96,
          maxGrade: 100,
          submittedDate: '2024-12-09',
          feedback: 'Excellent argument structure and evidence!'
        },
        { 
          id: 2, 
          title: 'Research Paper: Environmental Issues', 
          dueDate: '2024-12-22', 
          status: 'submitted', 
          grade: 94,
          maxGrade: 100,
          type: 'research',
          feedback: 'Strong research and citation work.'
        },
        { 
          id: 3, 
          title: 'Final Portfolio Submission', 
          dueDate: '2024-12-28', 
          status: 'in-progress', 
          grade: null,
          maxGrade: 150,
          type: 'portfolio'
        }
      ],
      materials: [
        { 
          id: 1, 
          title: 'Academic Writing Style Guide', 
          type: 'pdf', 
          size: '1.2 MB', 
          uploaded: '2024-09-01',
          category: 'reference',
          downloadCount: 78,
          url: '/materials/writing-guide.pdf'
        },
        { 
          id: 2, 
          title: 'Sample Essays Collection', 
          type: 'pdf', 
          size: '2.8 MB', 
          uploaded: '2024-09-03',
          category: 'examples',
          downloadCount: 92,
          url: '/materials/sample-essays.pdf'
        }
      ],
      announcements: [
        { 
          id: 1, 
          title: 'Writing Workshop This Friday', 
          content: 'Optional peer review workshop for final portfolios. Room 305, 3:00-5:00 PM.', 
          date: '2024-12-11',
          priority: 'medium',
          read: false
        }
      ],
      discussions: [
        { id: 1, title: 'Peer Review Partners', replies: 6, lastActivity: '2024-12-12' },
        { id: 2, title: 'Citation Format Questions', replies: 4, lastActivity: '2024-12-10' }
      ]
    }
  ]);

  // Available courses for browsing
  const [availableCourses] = useState([
    { id: 4, courseCode: 'CS201', title: 'Data Structures', credits: 3, instructor: 'Dr. Brown', enrolled: 15, max: 30, description: 'Advanced data structures and algorithms' },
    { id: 5, courseCode: 'MATH301', title: 'Linear Algebra', credits: 4, instructor: 'Dr. Davis', enrolled: 12, max: 25, description: 'Vector spaces, matrices, and linear transformations' },
    { id: 6, courseCode: 'PHYS101', title: 'General Physics I', credits: 4, instructor: 'Dr. Wilson', enrolled: 20, max: 35, description: 'Mechanics, thermodynamics, and wave motion' }
  ]);

  // Enhanced filtering and sorting
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [courses, searchTerm, sortBy, sortOrder, filterStatus]);

  // Enhanced course statistics
  const courseStats = useMemo(() => {
    const totalCredits = courses.reduce((total, course) => total + course.credits, 0);
    const totalClassmates = courses.reduce((total, course) => total + course.enrolledStudents, 0);
    const averageGrade = courses.reduce((total, course) => total + course.gradePoints, 0) / courses.length;
    const averageAttendance = courses.reduce((total, course) => total + course.attendance, 0) / courses.length;
    const unreadAnnouncements = courses.reduce((total, course) => 
      total + course.announcements.filter(ann => !ann.read).length, 0);
    const upcomingAssignments = courses.reduce((total, course) => 
      total + course.assignments.filter(assignment => 
        assignment.status === 'upcoming' || assignment.status === 'in-progress').length, 0);

    return {
    totalCourses: courses.length,
      totalCredits,
      totalClassmates,
      averageGrade,
      averageAttendance,
      unreadAnnouncements,
      upcomingAssignments
    };
  }, [courses]);

  // Utility functions
  const getStatusColor = (status) => {
    const statusColors = {
      enrolled: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      waitlist: 'bg-amber-100 text-amber-800 border-amber-200',
      dropped: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAssignmentStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-amber-500 bg-amber-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced event handlers
  const handleDownloadMaterial = useCallback(async (material) => {
    setLoading(true);
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create download link
      const link = document.createElement('a');
      link.href = material.url;
      link.download = material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `${material.title} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmitAssignment = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Assignment Submitted",
        description: `${assignmentForm.title} has been submitted successfully.`,
      });
      
      setAssignmentForm({ title: '', description: '', file: null });
      setShowAssignmentDialog(false);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [assignmentForm]);

  const handleContactInstructor = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the instructor.",
      });
      
      setContactForm({ subject: '', message: '', type: 'email' });
      setShowContactDialog(false);
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [contactForm]);

  const handleUploadMaterial = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Upload Successful",
        description: `${uploadForm.title} has been uploaded.`,
      });
      
      setUploadForm({ title: '', description: '', file: null, category: 'notes' });
      setShowUploadDialog(false);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Unable to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [uploadForm]);

  const handleToggleFavorite = useCallback((courseId) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, favorited: !course.favorited } : course
    ));
    
    toast({
      title: "Favorites Updated",
      description: "Course has been added to/removed from favorites.",
    });
  }, []);

  const handleMarkAnnouncementRead = useCallback((courseId, announcementId) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? {
            ...course,
            announcements: course.announcements.map(ann =>
              ann.id === announcementId ? { ...ann, read: true } : ann
            )
          }
        : course
    ));
  }, []);

  // Enhanced components
  const CourseCard = ({ course }) => (
    <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white via-gray-50/30 to-white border-0 shadow-lg overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/10 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Favorite indicator */}
      {course.favorited && (
        <div className="absolute top-4 right-4 z-10">
          <Heart className="h-5 w-5 text-red-500 fill-current" />
        </div>
      )}
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-lg mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold text-xl">
                {course.courseCode}
              </span>
              <span className="text-gray-700">- {course.title}</span>
              <Badge className={`${getStatusColor(course.status)} font-medium px-3 py-1 text-xs border`}>
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-gray-600 mb-3">
              {course.description}
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                {course.category}
              </Badge>
              <Badge className={`text-xs ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
            {course.credits} Credits
          </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Grade</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {course.grade}
              </p>
              <p className="text-xs text-muted-foreground">{course.gradePoints} GPA</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleFavorite(course.id)}
              className="p-2 hover:bg-red-50"
            >
              <Heart className={`h-4 w-4 ${course.favorited ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10">
        {/* Enhanced course details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50">
            <Users className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm font-medium text-blue-800 truncate">{course.instructor}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100/50">
            <Calendar className="h-4 w-4 text-green-600 shrink-0" />
            <span className="text-sm font-medium text-green-800 truncate">{course.schedule}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100/50">
            <MapPin className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="text-sm font-medium text-purple-800 truncate">{course.room}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100/50">
            <Users className="h-4 w-4 text-orange-600 shrink-0" />
            <span className="text-sm font-medium text-orange-800">{course.enrolledStudents}/{course.maxStudents}</span>
          </div>
        </div>
        
        {/* Enhanced progress section */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Course Progress</span>
            <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
          </div>
          <div className="relative">
            <Progress value={course.progress} className="h-3 bg-gray-100" />
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Attendance</span>
            <span className="text-sm font-bold text-gray-900">{course.attendance}%</span>
          </div>
          <div className="relative">
            <Progress value={course.attendance} className="h-2 bg-gray-100" />
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${course.attendance}%` }}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Assignments</p>
            <p className="text-lg font-bold text-blue-800">{course.assignments.length}</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-xs text-green-600 font-medium">Materials</p>
            <p className="text-lg font-bold text-green-800">{course.materials.length}</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-xs text-purple-600 font-medium">Discussions</p>
            <p className="text-lg font-bold text-purple-800">{course.discussions?.length || 0}</p>
          </div>
        </div>

        {/* Enhanced action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default"
            size="sm"
            onClick={() => {
              setSelectedCourse(course);
              setActiveTab('overview');
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedCourse(course);
              setActiveTab('assignments');
            }}
            className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200 transition-all duration-200"
          >
            <FileText className="h-4 w-4 mr-1" />
            Assignments ({course.assignments.filter(a => a.status === 'upcoming' || a.status === 'in-progress').length})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedCourse(course);
              setActiveTab('materials');
            }}
            className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-1" />
            Materials
          </Button>
          {course.announcements.some(ann => !ann.read) && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCourse(course);
                setActiveTab('announcements');
              }}
              className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200 transition-all duration-200 relative"
            >
              <Bell className="h-4 w-4 mr-1" />
              Announcements
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {course.announcements.filter(ann => !ann.read).length}
              </span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Enhanced stats card component
  const StatsCard = ({ icon: Icon, value, label, color, subtitle, trend }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" style={{
        background: `linear-gradient(135deg, ${color.replace('text-', '').replace('-500', '')}-100, ${color.replace('text-', '').replace('-500', '')}-200)`
      }} />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300`}
               style={{
                 background: `linear-gradient(135deg, ${color.replace('text-', '').replace('-500', '')}-400, ${color.replace('text-', '').replace('-500', '')}-600)`
               }}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(trend)}%
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Enhanced empty state
  if (courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-slate-50/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20 animate-pulse" />
                <BookOpen className="h-20 w-20 text-blue-600 mx-auto relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                No Courses Enrolled
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You haven't enrolled in any courses yet. Explore our course catalog to get started on your academic journey.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setShowAvailableCoursesDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Browse Available Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
        <div className="text-center space-y-6 mb-12">
        <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse scale-110" />
              <div className="p-6 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full shadow-2xl relative z-10">
                <GraduationCap className="h-16 w-16 text-white" />
          </div>
        </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          My Courses
        </h1>
            <p className="text-xl text-gray-600">
              Welcome back, <span className="font-semibold text-gray-800">{user?.firstName}</span>! Here's your academic overview for {courses[0]?.semester}
        </p>
      </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              variant="outline" 
              className="bg-slate-100/80 hover:bg-slate-200 border-blue-200 text-blue-700"
              onClick={() => setShowAvailableCoursesDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
            <Button 
              variant="outline" 
              className="bg-slate-100/80 hover:bg-slate-200 border-green-200 text-green-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
            <Button 
              variant="outline" 
              className="bg-slate-100/80 hover:bg-slate-200 border-purple-200 text-purple-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Grade Report
            </Button>
          </div>
        </div>

        {/* Enhanced Search and Filter */}
        <Card className="mb-8 border-0 shadow-lg bg-slate-50/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search courses, instructors, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-0 bg-gray-50 focus:bg-slate-100 transition-colors duration-200"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 h-12 bg-gray-50 border-0">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 h-12 bg-gray-50 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="courseCode">Course Code</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="grade">Grade</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="h-12 w-12 bg-gray-50 border-0 hover:bg-gray-100"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard
          icon={BookOpen}
          value={courseStats.totalCourses}
          label="Enrolled Courses"
          color="text-blue-500"
            subtitle={`${courseStats.upcomingAssignments} upcoming assignments`}
            trend={5}
        />
        <StatsCard
          icon={Clock}
          value={courseStats.totalCredits}
          label="Total Credits"
          color="text-green-500"
            subtitle="This semester"
            trend={0}
        />
        <StatsCard
            icon={Star}
            value={courseStats.averageGrade.toFixed(2)}
            label="Current GPA"
            color="text-orange-500"
            subtitle={`${courseStats.averageAttendance.toFixed(0)}% attendance`}
            trend={2}
          />
          <StatsCard
            icon={Bell}
            value={courseStats.unreadAnnouncements}
            label="New Announcements"
            color="text-red-500"
            subtitle="Requires attention"
            trend={-10}
        />
      </div>

      {/* Course List */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Current Semester</h2>
            <p className="text-gray-600">Fall 2024 • {filteredCourses.length} of {courses.length} courses shown</p>
        </div>
          
          <div className="space-y-8">
            {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        </div>

        {/* Available Courses Dialog */}
        <Dialog open={showAvailableCoursesDialog} onOpenChange={setShowAvailableCoursesDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Available Courses
              </DialogTitle>
              <DialogDescription>
                Browse and enroll in available courses for the upcoming semester.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {availableCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{course.courseCode} - {course.title}</h3>
                        <p className="text-gray-600 mt-1">{course.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm text-gray-500">Credits: {course.credits}</span>
                          <span className="text-sm text-gray-500">Instructor: {course.instructor}</span>
                          <span className="text-sm text-gray-500">Enrolled: {course.enrolled}/{course.max}</span>
                        </div>
                      </div>
                      <Button 
                        className="ml-4"
                        disabled={course.enrolled >= course.max}
                      >
                        {course.enrolled >= course.max ? 'Full' : 'Enroll'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Assignment Submission Dialog */}
        <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                Submit your assignment for {selectedCourse?.title}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <Label htmlFor="assignment-title">Assignment Title</Label>
                <Input
                  id="assignment-title"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="assignment-description">Description</Label>
                <Textarea
                  id="assignment-description"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="assignment-file">Upload File</Label>
                <Input
                  id="assignment-file"
                  type="file"
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, file: e.target.files[0] }))}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Contact Instructor Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Instructor</DialogTitle>
              <DialogDescription>
                Send a message to {selectedCourse?.instructor}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleContactInstructor} className="space-y-4">
              <div>
                <Label htmlFor="contact-type">Contact Method</Label>
                <Select value={contactForm.type} onValueChange={(value) => setContactForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="office-hours">Schedule Office Hours</SelectItem>
                    <SelectItem value="video-call">Request Video Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowContactDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Upload Material Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Material</DialogTitle>
              <DialogDescription>
                Upload study materials or notes for {selectedCourse?.title}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div>
                <Label htmlFor="upload-title">Material Title</Label>
                <Input
                  id="upload-title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="upload-category">Category</Label>
                <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="exercises">Exercises</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="examples">Examples</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="upload-description">Description</Label>
                <Textarea
                  id="upload-description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="upload-file">Upload File</Label>
                <Input
                  id="upload-file"
                  type="file"
                  onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files[0] }))}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload Material'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Enhanced Course Details Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {selectedCourse?.courseCode} - {selectedCourse?.title}
                    {selectedCourse?.favorited && (
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    )}
                  </div>
                  <DialogDescription className="text-left">
                    {selectedCourse?.description}
                  </DialogDescription>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedCourse && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="assignments" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Assignments
                    {selectedCourse.assignments.filter(a => a.status === 'upcoming' || a.status === 'in-progress').length > 0 && (
                      <Badge className="ml-1 bg-blue-100 text-blue-800 text-xs">
                        {selectedCourse.assignments.filter(a => a.status === 'upcoming' || a.status === 'in-progress').length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="materials" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Materials
                  </TabsTrigger>
                  <TabsTrigger value="announcements" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Announcements
                    {selectedCourse.announcements.filter(ann => !ann.read).length > 0 && (
                      <Badge className="ml-1 bg-red-100 text-red-800 text-xs">
                        {selectedCourse.announcements.filter(ann => !ann.read).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="discussions" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Discussions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Information */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          Course Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Instructor:</span>
                            <span className="text-gray-900">{selectedCourse.instructor}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="text-blue-600">{selectedCourse.instructorEmail}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Phone:</span>
                            <span className="text-gray-900">{selectedCourse.instructorPhone}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Schedule:</span>
                            <span className="text-gray-900">{selectedCourse.schedule}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Room:</span>
                            <span className="text-gray-900">{selectedCourse.room}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Office Hours:</span>
                            <span className="text-gray-900">{selectedCourse.officeHours}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Credits:</span>
                            <Badge className="bg-green-100 text-green-800">{selectedCourse.credits}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Difficulty:</span>
                            <Badge className={getDifficultyColor(selectedCourse.difficulty)}>
                              {selectedCourse.difficulty}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Enrollment:</span>
                            <span className="text-gray-900">{selectedCourse.enrolledStudents}/{selectedCourse.maxStudents}</span>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <Button 
                            className="w-full"
                            onClick={() => setShowContactDialog(true)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Contact Instructor
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Progress and Performance */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Your Progress & Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Course Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Course Progress</span>
                            <span className="font-bold">{selectedCourse.progress}%</span>
                          </div>
                          <div className="relative">
                            <Progress value={selectedCourse.progress} className="h-3 bg-gray-100" />
                            <div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
                              style={{ width: `${selectedCourse.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Attendance */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Attendance Rate</span>
                            <span className="font-bold">{selectedCourse.attendance}%</span>
                          </div>
                          <div className="relative">
                            <Progress value={selectedCourse.attendance} className="h-3 bg-gray-100" />
                            <div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                              style={{ width: `${selectedCourse.attendance}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Current Grade */}
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                          <p className="text-sm text-green-700 font-medium mb-1">Current Grade</p>
                          <p className="text-4xl font-bold text-green-800">{selectedCourse.grade}</p>
                          <p className="text-sm text-green-600">{selectedCourse.gradePoints} GPA Points</p>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium">Assignments</p>
                            <p className="text-lg font-bold text-blue-800">{selectedCourse.assignments.length}</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 font-medium">Materials</p>
                            <p className="text-lg font-bold text-purple-800">{selectedCourse.materials.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Prerequisites and Next Class */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Prerequisites</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedCourse.prerequisites.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedCourse.prerequisites.map((prereq, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-50">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No prerequisites required</p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Next Class</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">
                              {new Date(selectedCourse.nextClass).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(selectedCourse.nextClass).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Assignments & Assessments</h3>
                    <Button onClick={() => setShowAssignmentDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Assignment
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedCourse.assignments.map((assignment) => (
                      <Card key={assignment.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg">{assignment.title}</h4>
                                <Badge className={getAssignmentStatusColor(assignment.status)}>
                                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                </Badge>
                                {assignment.type && (
                                  <Badge variant="outline" className="text-xs">
                                    {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Due Date</p>
                                  <p className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                                </div>
                                {assignment.submittedDate && (
                                  <div>
                                    <p className="text-gray-600">Submitted</p>
                                    <p className="font-medium">{new Date(assignment.submittedDate).toLocaleDateString()}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-gray-600">Max Points</p>
                                  <p className="font-medium">{assignment.maxGrade}</p>
                                </div>
                                {assignment.duration && (
                                  <div>
                                    <p className="text-gray-600">Duration</p>
                                    <p className="font-medium">{assignment.duration}</p>
                                  </div>
                                )}
                              </div>
                              
                              {assignment.feedback && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800 font-medium">Instructor Feedback:</p>
                                  <p className="text-sm text-blue-700">{assignment.feedback}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right ml-4">
                              {assignment.grade !== null ? (
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-600">{assignment.grade}%</p>
                                  <p className="text-sm text-gray-600">Grade</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-lg font-medium text-gray-400">—</p>
                                  <p className="text-sm text-gray-500">Pending</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Course Materials</h3>
                    <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Material
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedCourse.materials.map((material) => (
                      <Card key={material.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg">{material.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span>{material.size}</span>
                                  <span>{material.type.toUpperCase()}</span>
                                  <span>Uploaded {new Date(material.uploaded).toLocaleDateString()}</span>
                                  <span>{material.downloadCount} downloads</span>
                                </div>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {material.category.charAt(0).toUpperCase() + material.category.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleDownloadMaterial(material)}
                              disabled={loading}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {loading ? 'Downloading...' : 'Download'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="announcements" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Course Announcements</h3>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Instructor
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedCourse.announcements.map((announcement) => (
                      <Card 
                        key={announcement.id} 
                        className={`border-l-4 shadow-lg ${getPriorityColor(announcement.priority)} ${
                          !announcement.read ? 'ring-2 ring-blue-200' : ''
                        }`}
                        onClick={() => handleMarkAnnouncementRead(selectedCourse.id, announcement.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg">{announcement.title}</h4>
                                {!announcement.read && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">New</Badge>
                                )}
                                <Badge 
                                  className={`text-xs ${
                                    announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority
                                </Badge>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm text-gray-500">
                                {new Date(announcement.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="discussions" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Course Discussions</h3>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Discussion
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedCourse.discussions?.map((discussion) => (
                      <Card key={discussion.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-lg">{discussion.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {discussion.replies} replies • Last activity: {new Date(discussion.lastActivity).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-gray-400" />
                              <span className="text-sm font-medium">{discussion.replies}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )) || (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No discussions yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Theme Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center justify-between p-4 theme-toggle-card rounded-lg shadow-lg">
          <div>
            <p className="font-medium">Theme Mode</p>
            <p className="text-sm text-muted-foreground">
              {darkMode ? 'Currently in dark mode' : 'Currently in light mode'}
            </p>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-primary ml-4"
          />
        </div>
      </div>
    </div>
  );
};

export default Courses;
