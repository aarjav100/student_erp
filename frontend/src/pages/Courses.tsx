import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen, Clock, Users, Calendar, MapPin, FileText, Download, Upload, MessageSquare,
  Star, Heart, Share2, Eye, Plus, Search, Filter, SortAsc, SortDesc,
  Bell, CheckCircle, TrendingUp, Award, GraduationCap, Zap, Moon, Sun, Mail
} from 'lucide-react';


// Status color utilities
const getStatusColors = {
  dot: (status) => ({
    'enrolled': 'bg-green-500',
    'completed': 'bg-blue-500',
    'dropped': 'bg-red-500',
    'pending': 'bg-yellow-500'
  }[status] || 'bg-gray-500'),
  
  badge: (status) => ({
    enrolled: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    waitlist: 'bg-amber-100 text-amber-800 border-amber-200',
    dropped: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  }[status] || 'bg-gray-100 text-gray-800 border-gray-200'),

  difficulty: (difficulty) => ({
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800'
  }[difficulty] || 'bg-gray-100 text-gray-800'),

  assignment: (status) => ({
    'submitted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'upcoming': 'bg-amber-100 text-amber-800 border-amber-200',
    'overdue': 'bg-red-100 text-red-800 border-red-200'
  }[status] || 'bg-gray-100 text-gray-800 border-gray-200'),

  priority: (priority) => ({
    high: 'border-l-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-600',
    medium: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-600',
    low: 'border-l-green-500 bg-green-50 dark:bg-green-900/10 dark:border-green-600'
  }[priority] || 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10 dark:border-gray-600')
};

// Optimized CourseCard component
const CourseCard = ({ course, onSelectCourse, onToggleFavorite }) => (
  <Card className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-[1.02] bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-800 dark:to-slate-900 border-0 shadow-xl overflow-hidden relative backdrop-blur-sm">
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-xl dark:from-blue-900/20" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-xl dark:from-purple-900/20" />
    </div>

    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
      <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-300" />
      <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse delay-700" />
    </div>

    {course.favorited && (
      <div className="absolute top-4 right-4 z-20 animate-bounce">
        <div className="relative">
          <Heart className="h-6 w-6 text-red-500 fill-current drop-shadow-lg" />
          <div className="absolute inset-0 h-6 w-6 bg-red-400/20 rounded-full animate-ping" />
        </div>
      </div>
    )}

    <div className="absolute top-4 left-4 z-20">
      <div className={`w-3 h-3 rounded-full shadow-lg animate-pulse ${getStatusColors.dot(course.status)}`} />
    </div>

    <CardHeader className="pb-6 relative z-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <CardTitle className="flex flex-wrap items-center gap-2.5 text-base mb-2.5 leading-tight">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold text-xl tracking-tight">
                  {course.courseCode}
                </span>
                <div className="text-xs leading-tight text-gray-500 dark:text-gray-400 font-medium">{course.semester}</div>
              </div>
            </div>
            <Badge className={`font-semibold px-3 py-1 text-[10px] border shadow ${getStatusColors.badge(course.status)}`}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </Badge>
          </CardTitle>
          
          <CardDescription className="text-sm leading-snug text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {course.description}
          </CardDescription>
          
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px] bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors">
              <GraduationCap className="h-3 w-3 mr-1" />
              {course.category}
            </Badge>
            <Badge className={`text-[10px] shadow-sm ${getStatusColors.difficulty(course.difficulty)}`}>
              <Zap className="h-3 w-3 mr-1" />
              {course.difficulty}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-green-50 border-green-300 text-green-700 hover:bg-green-100 transition-colors">
              <Award className="h-3 w-3 mr-1" />
              {course.credits} Credits
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="text-right bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 p-2.5 rounded-2xl border border-green-200/50 dark:border-green-800/50 shadow-sm">
            <p className="text-[11px] text-green-600 dark:text-green-400 font-medium mb-0.5">Current Grade</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {course.grade}
            </p>
            <p className="text-[11px] text-green-500 dark:text-green-300 font-medium leading-tight">{course.gradePoints} GPA</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(course._id)}
            className="p-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
          >
            <Heart className={`h-2.5 w-2.5 transition-all duration-200 ${course.favorited ? 'text-red-500 fill-current' : 'text-gray-400 dark:text-gray-600'}`} />
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent className="pt-0 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-4">
        {[
          { icon: Users, label: 'Instructor', value: course.instructor, color: 'blue' },
          { icon: Calendar, label: 'Schedule', value: course.schedule, color: 'green' },
          { icon: MapPin, label: 'Location', value: course.room, color: 'purple' },
          { icon: Users, label: 'Enrollment', value: `${course.enrolledStudents}/${course.maxStudents}`, color: 'orange' }
        ].map(({ icon: Icon, label, value, color }, idx) => (
          <div key={idx} className={`flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-${color}-50 to-${color}-100/70 dark:from-${color}-900/50 dark:to-${color}-950/50 border border-${color}-200/50 dark:border-${color}-800/50 hover:shadow-md transition-all duration-200`}>
            <div className={`w-6 h-6 bg-${color}-500 rounded-lg flex items-center justify-center shadow-sm`}>
              <Icon className="h-3 w-3 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs text-${color}-600 dark:text-${color}-400 font-medium`}>{label}</p>
              <p className={`text-sm font-semibold text-${color}-800 dark:text-${color}-200 truncate`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3.5 mb-5">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-950/50 p-2.5 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Course Progress
            </span>
            <span className="text-base font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full shadow-sm">{course.progress}%</span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1500 ease-out shadow-lg"
              style={{ width: `${course.progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/50 dark:to-green-950/50 p-2.5 rounded-2xl border border-green-200/50 dark:border-green-800/50">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Attendance
            </span>
            <span className="text-base font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full shadow-sm">{course.attendance}%</span>
          </div>
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1500 ease-out shadow-lg"
              style={{ width: `${course.attendance}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {[
          { icon: FileText, label: 'Assignments', value: course.assignments?.length || 0, color: 'blue' },
          { icon: Download, label: 'Materials', value: course.materials?.length || 0, color: 'green' },
          { icon: MessageSquare, label: 'Discussions', value: course.discussions?.length || 0, color: 'purple' }
        ].map(({ icon: Icon, label, value, color }, idx) => (
          <div key={idx} className={`text-center p-3 bg-gradient-to-br from-${color}-50 to-${color}-100/70 dark:from-${color}-900/50 dark:to-${color}-950/50 rounded-2xl border border-${color}-200/50 dark:border-${color}-800/50 hover:shadow-lg transition-all duration-200 hover:scale-105`}>
            <div className={`w-8 h-8 bg-${color}-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <p className={`text-xs text-${color}-600 dark:text-${color}-400 font-medium mb-1`}>{label}</p>
            <p className={`text-lg font-bold text-${color}-800 dark:text-${color}-200`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button
          variant="default"
          size="sm"
          onClick={() => onSelectCourse(course)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transition-all rounded-md px-2 py-1 text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectCourse(course, 'assignments')}
          className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100 transition-all rounded-md px-2 py-1 text-xs"
        >
          <FileText className="h-3 w-3 mr-1" />
          Assign ({(course.assignments?.filter(a => a.status === 'upcoming' || a.status === 'in-progress').length) || 0})
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectCourse(course, 'materials')}
          className="bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100 transition-all rounded-md px-2 py-1 text-xs"
        >
          <Download className="h-3 w-3 mr-1" />
          Materials
        </Button>
        
        {course.announcements?.some(ann => !ann.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectCourse(course, 'announcements')}
            className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100 transition-all rounded-md px-2 py-1 text-xs relative"
          >
            <Bell className="h-3 w-3 mr-1" />
            Announcements
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center font-bold shadow">
              {(course.announcements?.filter(ann => !ann.read).length) || 0}
            </span>
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Optimized StatsCard component
const StatsCard = ({ icon: Icon, value, label, color, subtitle, trend }: { icon: any; value: any; label: any; color: any; subtitle?: any; trend?: any }) => (
  <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-lg overflow-hidden relative">
    <div className={`absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300 ${
      color === 'text-blue-500' ? 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950' :
      color === 'text-green-500' ? 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-950' :
      color === 'text-orange-500' ? 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-950' :
      'from-red-100 to-red-200 dark:from-red-900 dark:to-red-950'
    }`} />
    <CardContent className="p-4 relative z-10">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300 ${
          color === 'text-blue-500' ? 'from-blue-400 to-blue-600' :
          color === 'text-green-500' ? 'from-green-400 to-green-600' :
          color === 'text-orange-500' ? 'from-orange-400 to-orange-600' :
          'from-red-400 to-red-600'
        }`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
              }`}>
                <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <p className="text-sm leading-snug text-gray-600 dark:text-gray-400 font-medium">{label}</p>
          {subtitle && <p className="text-xs leading-snug text-gray-500 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main optimized component
const Courses = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('courseCode');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', file: null });
  const [contactForm, setContactForm] = useState({ subject: '', message: '', type: 'email' });
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', file: null, category: 'notes' });

  // Dialog states
  const [dialogs, setDialogs] = useState({
    assignment: false,
    contact: false,
    upload: false,
    availableCourses: false
  });

  const toggleDialog = useCallback((dialogName, state) => {
    setDialogs(prev => ({ ...prev, [dialogName]: state }));
  }, []);

  const [courses, setCourses] = useState<any[]>([
    {
      _id: '1', courseCode: 'CS101', title: 'Introduction to Computer Science', 
      description: 'Comprehensive introduction to programming concepts, algorithms, and computer science fundamentals including data structures and software development principles.',
      credits: 3, instructor: 'Dr. Sarah Smith', instructorEmail: 'sarah.smith@university.edu', instructorPhone: '+1 (555) 123-4567', 
      schedule: 'MWF 10:00-11:15', room: 'Engineering Building - Room 101',
      enrolledStudents: 25, maxStudents: 30, status: 'enrolled', semester: 'Fall 2024', progress: 75, grade: 'A-', 
      gradePoints: 3.7, attendance: 92, nextClass: '2024-12-15T10:00:00',
      officeHours: 'Tuesday 2:00-4:00 PM', favorited: true, difficulty: 'Intermediate', category: 'Computer Science', 
      prerequisites: ['MATH100'],
      assignments: [
        { id: 1, title: 'Programming Assignment 1: Basic Algorithms', dueDate: '2024-12-15', status: 'submitted', grade: 95, maxGrade: 100, submittedDate: '2024-12-14', feedback: 'Excellent work on algorithm implementation!' },
        { id: 2, title: 'Midterm Exam', dueDate: '2024-12-20', status: 'upcoming', grade: null, maxGrade: 100, type: 'exam', duration: '2 hours' },
        { id: 3, title: 'Final Project: Web Application', dueDate: '2024-12-30', status: 'in-progress', grade: null, maxGrade: 200, type: 'project', groupProject: true }
      ],
      materials: [
        { id: 1, title: 'Course Syllabus', type: 'pdf', size: '2.5 MB', uploaded: '2024-09-01', category: 'syllabus', downloadCount: 156, url: '/materials/cs101-syllabus.pdf' },
        { id: 2, title: 'Lecture Notes - Week 1: Introduction', type: 'pdf', size: '1.8 MB', uploaded: '2024-09-03', category: 'notes', downloadCount: 89, url: '/materials/cs101-week1.pdf' }
      ],
      announcements: [
        { id: 1, title: 'Office Hours Schedule Update', content: 'Office hours have been moved to Tuesday 2-4 PM this week due to faculty meeting conflicts.', date: '2024-12-10', priority: 'medium', read: false },
        { id: 2, title: 'Assignment Extension Granted', content: 'Due to technical difficulties, Assignment 1 deadline has been extended by 2 days. New deadline: December 17th.', date: '2024-12-08', priority: 'high', read: true }
      ],
      discussions: [
        { id: 1, title: 'Help with Assignment 1', replies: 8, lastActivity: '2024-12-12' },
        { id: 2, title: 'Study Group Formation', replies: 15, lastActivity: '2024-12-11' }
      ]
    }
    // Add more courses as needed
  ]);

  const [availableCourses] = useState<any[]>([
    { _id: '4', courseCode: 'CS201', title: 'Data Structures', credits: 3, instructor: 'Dr. Brown', enrolled: 15, max: 30, description: 'Advanced data structures and algorithms' },
    { _id: '5', courseCode: 'MATH301', title: 'Linear Algebra', credits: 4, instructor: 'Dr. Davis', enrolled: 12, max: 25, description: 'Vector spaces, matrices, and linear transformations' }
  ]);

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const fields = [course?.title, course?.courseCode, course?.instructor, course?.category];
      const matchesSearch = fields.some(field =>
        (field ?? '').toString().toLowerCase().includes((searchTerm ?? '').toLowerCase())
      );
      const matchesStatus = filterStatus === 'all' || course?.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      const aRaw = a?.[sortBy];
      const bRaw = b?.[sortBy];
      const bothStrings = typeof aRaw === 'string' || typeof bRaw === 'string';
      if (bothStrings) {
        const aStr = (aRaw ?? '').toString().toLowerCase();
        const bStr = (bRaw ?? '').toString().toLowerCase();
        const cmp = aStr.localeCompare(bStr);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      const aNum = Number(aRaw ?? 0);
      const bNum = Number(bRaw ?? 0);
      const cmp = aNum - bNum;
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    
    return filtered;
  }, [courses, searchTerm, sortBy, sortOrder, filterStatus]);

  // Memoized course statistics
  const courseStats = useMemo(() => {
    const totalCredits = courses.reduce((total, course) => total + course.credits, 0);
    const averageGrade = courses.reduce((total, course) => total + course.gradePoints, 0) / courses.length;
    const averageAttendance = courses.reduce((total, course) => total + course.attendance, 0) / courses.length;
    const unreadAnnouncements = courses.reduce((total, course) =>
      total + (course.announcements?.filter(ann => !ann.read).length || 0), 0);
    const upcomingAssignments = courses.reduce((total, course) =>
      total + (course.assignments?.filter(assignment =>
        assignment.status === 'upcoming' || assignment.status === 'in-progress').length || 0), 0);

    return {
      totalCourses: courses.length,
      totalCredits,
      averageGrade,
      averageAttendance,
      unreadAnnouncements,
      upcomingAssignments
    };
  }, [courses]);

  // Optimized handlers
  const handleDownloadMaterial = useCallback(async (material) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const link = document.createElement('a');
      link.href = material.url;
      link.download = material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Download Started", description: `${material.title} is being downloaded.` });
    } catch (error) {
      toast({ title: "Download Failed", description: "Unable to download the file. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmitAssignment = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: "Assignment Submitted", description: `${assignmentForm.title} has been submitted successfully.` });
      setAssignmentForm({ title: '', description: '', file: null });
      toggleDialog('assignment', false);
    } catch (error) {
      toast({ title: "Submission Failed", description: "Unable to submit assignment. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [assignmentForm, toggleDialog]);

  const handleContactInstructor = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({ title: "Message Sent", description: `Your ${contactForm.type} has been sent to the instructor.` });
      setContactForm({ subject: '', message: '', type: 'email' });
      toggleDialog('contact', false);
    } catch (error) {
      toast({ title: "Send Failed", description: "Unable to send message. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [contactForm, toggleDialog]);

  const handleUploadMaterial = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: "Upload Complete", description: `${uploadForm.title} has been uploaded successfully.` });
      setUploadForm({ title: '', description: '', file: null, category: 'notes' });
      toggleDialog('upload', false);
    } catch (error) {
      toast({ title: "Upload Failed", description: "Unable to upload file. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [uploadForm, toggleDialog]);

  const handleToggleFavorite = useCallback((courseId) => {
    setCourses(prev => prev.map(course =>
      course._id === courseId ? { ...course, favorited: !course.favorited } : course
    ));
    toast({ title: "Updated", description: "Course favorite status updated." });
  }, []);

  const handleSelectCourse = useCallback((course, tab = 'overview') => {
    setSelectedCourse(course);
    setActiveTab(tab);
  }, []);

  const handleEnrollCourse = useCallback(async (courseId) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const courseToEnroll = availableCourses.find(c => c._id === courseId);
      if (courseToEnroll) {
        const newCourse = {
          _id: courseToEnroll._id,
          courseCode: courseToEnroll.courseCode,
          title: courseToEnroll.title,
          description: courseToEnroll.description,
          credits: courseToEnroll.credits,
          instructor: courseToEnroll.instructor,
          instructorEmail: 'instructor@example.com',
          instructorPhone: '+1 (000) 000-0000',
          schedule: 'TBD',
          room: 'TBD',
          enrolledStudents: courseToEnroll.enrolled + 1,
          maxStudents: courseToEnroll.max,
          status: 'enrolled',
          semester: 'Fall 2024',
          progress: 0,
          grade: 'N/A',
          gradePoints: 0,
          attendance: 100,
          nextClass: new Date().toISOString(),
          officeHours: 'TBD',
          favorited: false,
          difficulty: 'Intermediate',
          category: 'General',
          prerequisites: [],
          assignments: [],
          materials: [],
          announcements: [],
          discussions: []
        };
        setCourses(prev => [...prev, newCourse]);
        toast({ title: "Enrollment Successful", description: `You have been enrolled in ${courseToEnroll.title}.` });
        toggleDialog('availableCourses', false);
      }
    } catch (error) {
      toast({ title: "Enrollment Failed", description: "Unable to enroll in course. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [availableCourses, toggleDialog]);

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'dark bg-gradient-to-br from-slate-900 via-gray-900 to-black' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-32 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1.5">
                Welcome back, {user?.firstName ?? 'User'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-tight">
                Manage your courses, track your progress, and stay organized.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="border-2 hover:scale-105 transition-transform"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                onClick={() => toggleDialog('availableCourses', true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md rounded-md px-3 py-1.5 text-sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Enroll
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            icon={BookOpen} 
            value={courseStats.totalCourses} 
            label="Total Courses" 
            color="text-blue-500"
            subtitle="Currently enrolled"
            trend={5}
          />
          <StatsCard 
            icon={GraduationCap} 
            value={courseStats.averageGrade.toFixed(1)} 
            label="Average GPA" 
            color="text-green-500"
            subtitle={`${courseStats.totalCredits} total credits`}
            trend={2}
          />
          <StatsCard 
            icon={CheckCircle} 
            value={`${Math.round(courseStats.averageAttendance)}%`} 
            label="Attendance Rate" 
            color="text-orange-500"
            subtitle="Across all courses"
            trend={-1}
          />
          <StatsCard 
            icon={Bell} 
            value={courseStats.unreadAnnouncements} 
            label="New Notifications" 
            color="text-red-500"
            subtitle={`${courseStats.upcomingAssignments} assignments due`}
          />
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses, instructors, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 border-2">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-2">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="courseCode">Course Code</SelectItem>
                    <SelectItem value="title">Course Title</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="grade">Grade</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="border-2 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 mb-8">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onSelectCourse={handleSelectCourse}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card className="text-center py-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={() => toggleDialog('availableCourses', true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                Browse Available Courses
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Course Detail Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto bg-white dark:bg-slate-900 border-0 shadow-2xl">
            {selectedCourse && (
              <>
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {selectedCourse.courseCode}: {selectedCourse.title}
                      </DialogTitle>
                      <DialogDescription className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                        {selectedCourse.instructor} • {selectedCourse.schedule}
                      </DialogDescription>
                    </div>
                    <Badge className={`text-sm px-4 py-2 ${getStatusColors.badge(selectedCourse.status)}`}>
                      {selectedCourse.status.charAt(0).toUpperCase() + selectedCourse.status.slice(1)}
                    </Badge>
                  </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                  <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-slate-800">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="discussions">Discussions</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Course Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-gray-700 dark:text-gray-300">{selectedCourse.description}</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Credits</Label>
                                <p>{selectedCourse.credits}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Difficulty</Label>
                                <Badge className={getStatusColors.difficulty(selectedCourse.difficulty)}>
                                  {selectedCourse.difficulty}
                                </Badge>
                              </div>
                              <div>
                                <Label className="font-semibold">Room</Label>
                                <p>{selectedCourse.room}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Enrollment</Label>
                                <p>{selectedCourse.enrolledStudents}/{selectedCourse.maxStudents}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Progress Overview</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-2">
                                  <Label>Course Progress</Label>
                                  <span className="font-semibold">{selectedCourse.progress}%</span>
                                </div>
                                <Progress value={selectedCourse.progress} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-2">
                                  <Label>Attendance</Label>
                                  <span className="font-semibold">{selectedCourse.attendance}%</span>
                                </div>
                                <Progress value={selectedCourse.attendance} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Current Grade</CardTitle>
                          </CardHeader>
                          <CardContent className="text-center">
                            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                              {selectedCourse.grade}
                            </div>
                            <div className="text-lg text-gray-600 dark:text-gray-400">
                              {selectedCourse.gradePoints} GPA
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span>Assignments</span>
                              <span className="font-semibold">{selectedCourse.assignments.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Materials</span>
                              <span className="font-semibold">{selectedCourse.materials.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Discussions</span>
                              <span className="font-semibold">{selectedCourse.discussions?.length || 0}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="assignments" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Assignments</h3>
                        <Button onClick={() => toggleDialog('assignment', true)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Submit Assignment
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {selectedCourse.assignments?.map((assignment) => (
                          <Card key={assignment.id} className={`${getStatusColors.priority(assignment.status === 'overdue' ? 'high' : assignment.status === 'upcoming' ? 'medium' : 'low')} border-l-4`}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">{assignment.title}</h4>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                    </span>
                                    {assignment.grade && (
                                      <span className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        {assignment.grade}/{assignment.maxGrade}
                                      </span>
                                    )}
                                  </div>
                                  {assignment.feedback && (
                                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                                      <strong>Feedback:</strong> {assignment.feedback}
                                    </div>
                                  )}
                                </div>
                                <Badge className={`ml-4 ${getStatusColors.assignment(assignment.status)}`}>
                                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="materials" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Course Materials</h3>
                        <Button onClick={() => toggleDialog('upload', true)} size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Material
                        </Button>
                      </div>
                      
                      <div className="grid gap-4">
                        {selectedCourse.materials?.map((material) => (
                          <Card key={material.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{material.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {material.type.toUpperCase()} • {material.size} • {material.downloadCount} downloads
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => handleDownloadMaterial(material)} 
                                  size="sm" 
                                  disabled={loading}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="announcements" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Course Announcements</h3>
                      
                      <div className="space-y-4">
                        {selectedCourse.announcements?.map((announcement) => (
                          <Card key={announcement.id} className={`${getStatusColors.priority(announcement.priority)} border-l-4`}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">{announcement.title}</h4>
                                  <p className="text-gray-700 dark:text-gray-300 mt-2">{announcement.content}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {new Date(announcement.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}>
                                    {announcement.priority}
                                  </Badge>
                                  {!announcement.read && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="discussions" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Course Discussions</h3>
                      
                      <div className="space-y-4">
                        {selectedCourse.discussions?.map((discussion) => (
                          <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-semibold">{discussion.title}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {discussion.replies} replies • Last activity: {new Date(discussion.lastActivity).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Join Discussion
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )) || (
                          <Card>
                            <CardContent className="p-8 text-center">
                              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h4 className="font-semibold text-gray-600 dark:text-gray-400">No discussions yet</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-500">Be the first to start a discussion!</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Instructor Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="font-semibold">Name</Label>
                            <p>{selectedCourse.instructor}</p>
                          </div>
                          <div>
                            <Label className="font-semibold">Email</Label>
                            <p>{selectedCourse.instructorEmail}</p>
                          </div>
                          <div>
                            <Label className="font-semibold">Phone</Label>
                            <p>{selectedCourse.instructorPhone}</p>
                          </div>
                          <div>
                            <Label className="font-semibold">Office Hours</Label>
                            <p>{selectedCourse.officeHours}</p>
                          </div>
                          <Button 
                            onClick={() => toggleDialog('contact', true)} 
                            className="w-full mt-4"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Office Hours
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Request Extension
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Join Study Group
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Course
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Assignment Submission Dialog */}
        <Dialog open={dialogs.assignment} onOpenChange={(open) => toggleDialog('assignment', open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                Upload your assignment files and provide any additional information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <Label htmlFor="assignment-title">Assignment Title</Label>
                <Input
                  id="assignment-title"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter assignment title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="assignment-description">Description</Label>
                <Textarea
                  id="assignment-description"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter assignment description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="assignment-file">Upload File</Label>
                <Input
                  id="assignment-file"
                  type="file"
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, file: e.target.files[0] }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Assignment'}
                </Button>
                <Button type="button" variant="outline" onClick={() => toggleDialog('assignment', false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Contact Instructor Dialog */}
        <Dialog open={dialogs.contact} onOpenChange={(open) => toggleDialog('contact', open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Instructor</DialogTitle>
              <DialogDescription>
                Send a message to your course instructor.
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
                    <SelectItem value="message">Internal Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter message subject"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your message"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
                <Button type="button" variant="outline" onClick={() => toggleDialog('contact', false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Upload Material Dialog */}
        <Dialog open={dialogs.upload} onOpenChange={(open) => toggleDialog('upload', open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Course Material</DialogTitle>
              <DialogDescription>
                Share study materials, notes, or resources with your classmates.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div>
                <Label htmlFor="upload-title">Material Title</Label>
                <Input
                  id="upload-title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter material title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="upload-description">Description</Label>
                <Textarea
                  id="upload-description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter material description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="upload-category">Category</Label>
                <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">Lecture Notes</SelectItem>
                    <SelectItem value="slides">Slides</SelectItem>
                    <SelectItem value="handouts">Handouts</SelectItem>
                    <SelectItem value="resources">Additional Resources</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload Material'}
                </Button>
                <Button type="button" variant="outline" onClick={() => toggleDialog('upload', false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Available Courses Dialog */}
        <Dialog open={dialogs.availableCourses} onOpenChange={(open) => toggleDialog('availableCourses', open)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Available Courses</DialogTitle>
              <DialogDescription>
                Browse and enroll in available courses for the current semester.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 mt-4">
              {availableCourses.map((course) => (
                <Card key={course._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{course.courseCode}: {course.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{course.instructor}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{course.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course.credits} Credits
                          </span>
                          <span>{course.enrolled}/{course.max} Enrolled</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleEnrollCourse(course._id)}
                        disabled={loading || course.enrolled >= course.max}
                        className="ml-4"
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
      </div>
    </div>
  );
};

export default Courses;