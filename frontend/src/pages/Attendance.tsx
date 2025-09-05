import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, CheckCircle, XCircle, Clock, TrendingUp, Download, BarChart3, 
  CalendarDays, AlertTriangle, Target, FileText, Printer, Filter, Eye, 
  Calendar as CalendarIcon, Search, ArrowUp, ArrowDown, Trophy, 
  BookOpen, Users, MapPin, User, GraduationCap, Star, Edit, Plus, Trash2, Save, X,
  Shield, Lock
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { AdminOnly, RoleBasedAccess } from '@/components/RoleBasedAccess';

interface AttendanceRecord {
  id: number;
  courseCode: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  instructor: string;
  notes: string;
  time: string;
  duration: string;
  location: string;
  semester: string;
}

interface TimetableSlot {
  id: number;
  day: string;
  time: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  location: string;
  duration: string;
  color: string;
}

const Attendance = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'course' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isEditingTimetable, setIsEditingTimetable] = useState(false);
  
  // Only allow editing if user is admin
  const canEditTimetable = user?.role === 'admin';
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
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

  // Enhanced mock attendance data
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    {
      id: 1, courseCode: 'CS101', courseName: 'Introduction to Computer Science',
      date: '2024-12-15', status: 'present', instructor: 'Dr. Smith',
      notes: '', time: '10:00 AM', duration: '75 minutes',
      location: 'Room 101', semester: 'Fall 2024'
    },
    {
      id: 2, courseCode: 'MATH201', courseName: 'Calculus I',
      date: '2024-12-15', status: 'present', instructor: 'Dr. Johnson',
      notes: '', time: '2:00 PM', duration: '90 minutes',
      location: 'Room 202', semester: 'Fall 2024'
    },
    {
      id: 3, courseCode: 'ENG101', courseName: 'English Composition',
      date: '2024-12-15', status: 'late', instructor: 'Dr. Williams',
      notes: 'Arrived 10 minutes late', time: '1:00 PM', duration: '75 minutes',
      location: 'Room 303', semester: 'Fall 2024'
    },
    {
      id: 4, courseCode: 'CS101', courseName: 'Introduction to Computer Science',
      date: '2024-12-13', status: 'absent', instructor: 'Dr. Smith',
      notes: 'Medical appointment', time: '10:00 AM', duration: '75 minutes',
      location: 'Room 101', semester: 'Fall 2024'
    },
    {
      id: 5, courseCode: 'MATH201', courseName: 'Calculus I',
      date: '2024-12-13', status: 'present', instructor: 'Dr. Johnson',
      notes: '', time: '2:00 PM', duration: '90 minutes',
      location: 'Room 202', semester: 'Fall 2024'
    },
    {
      id: 6, courseCode: 'ENG101', courseName: 'English Composition',
      date: '2024-12-13', status: 'present', instructor: 'Dr. Williams',
      notes: '', time: '1:00 PM', duration: '75 minutes',
      location: 'Room 303', semester: 'Fall 2024'
    },
    {
      id: 7, courseCode: 'CS101', courseName: 'Introduction to Computer Science',
      date: '2024-12-11', status: 'present', instructor: 'Dr. Smith',
      notes: '', time: '10:00 AM', duration: '75 minutes',
      location: 'Room 101', semester: 'Fall 2024'
    },
    {
      id: 8, courseCode: 'MATH201', courseName: 'Calculus I',
      date: '2024-12-11', status: 'late', instructor: 'Dr. Johnson',
      notes: 'Arrived 5 minutes late', time: '2:00 PM', duration: '90 minutes',
      location: 'Room 202', semester: 'Fall 2024'
    },
    {
      id: 9, courseCode: 'ENG101', courseName: 'English Composition',
      date: '2024-12-11', status: 'present', instructor: 'Dr. Williams',
      notes: '', time: '1:00 PM', duration: '75 minutes',
      location: 'Room 303', semester: 'Fall 2024'
    },
    {
      id: 10, courseCode: 'CS101', courseName: 'Introduction to Computer Science',
      date: '2024-12-09', status: 'present', instructor: 'Dr. Smith',
      notes: '', time: '10:00 AM', duration: '75 minutes',
      location: 'Room 101', semester: 'Fall 2024'
    },
    {
      id: 11, courseCode: 'MATH201', courseName: 'Calculus I',
      date: '2024-12-09', status: 'absent', instructor: 'Dr. Johnson',
      notes: 'Family emergency', time: '2:00 PM', duration: '90 minutes',
      location: 'Room 202', semester: 'Fall 2024'
    },
    {
      id: 12, courseCode: 'ENG101', courseName: 'English Composition',
      date: '2024-12-09', status: 'present', instructor: 'Dr. Williams',
      notes: '', time: '1:00 PM', duration: '75 minutes',
      location: 'Room 303', semester: 'Fall 2024'
    }
  ]);

  // Timetable data with 8 periods per day
  const [timetable, setTimetable] = useState<TimetableSlot[]>([
    // Monday - 8 periods
    {
      id: 1,
      day: 'Monday',
      time: '8:00 AM - 8:50 AM',
      courseCode: 'FREE',
      courseName: 'Free Period',
      instructor: 'N/A',
      location: 'N/A',
      duration: '50 minutes',
      color: 'bg-gray-100 border-gray-300 text-gray-800'
    },
    {
      id: 2,
      day: 'Monday',
      time: '9:00 AM - 9:50 AM',
      courseCode: 'CSE101',
      courseName: 'Introduction to Computer Science',
      instructor: 'Dr. Smith',
      location: 'Room 101',
      duration: '50 minutes',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    {
      id: 3,
      day: 'Monday',
      time: '10:00 AM - 10:50 AM',
      courseCode: 'MAT201',
      courseName: 'Calculus I',
      instructor: 'Dr. Johnson',
      location: 'Room 202',
      duration: '50 minutes',
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    {
      id: 4,
      day: 'Monday',
      time: '11:00 AM - 11:50 AM',
      courseCode: 'ENG101',
      courseName: 'English Composition',
      instructor: 'Dr. Williams',
      location: 'Room 303',
      duration: '50 minutes',
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    {
      id: 5,
      day: 'Monday',
      time: '12:00 PM - 12:50 PM',
      courseCode: 'LUNCH',
      courseName: 'Lunch Break',
      instructor: 'N/A',
      location: 'Cafeteria',
      duration: '50 minutes',
      color: 'bg-orange-100 border-orange-300 text-orange-800'
    },
    {
      id: 6,
      day: 'Monday',
      time: '1:00 PM - 1:50 PM',
      courseCode: 'PHY101',
      courseName: 'Physics I',
      instructor: 'Dr. Brown',
      location: 'Room 404',
      duration: '50 minutes',
      color: 'bg-red-100 border-red-300 text-red-800'
    },
    {
      id: 7,
      day: 'Monday',
      time: '2:00 PM - 2:50 PM',
      courseCode: 'CHE101',
      courseName: 'Chemistry I',
      instructor: 'Dr. Davis',
      location: 'Lab 101',
      duration: '50 minutes',
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
    },
    {
      id: 8,
      day: 'Monday',
      time: '3:00 PM - 3:50 PM',
      courseCode: 'HIS101',
      courseName: 'World History',
      instructor: 'Dr. Wilson',
      location: 'Room 505',
      duration: '50 minutes',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },

    // Tuesday - 8 periods
    {
      id: 9,
      day: 'Tuesday',
      time: '8:00 AM - 8:50 AM',
      courseCode: 'MAT201',
      courseName: 'Calculus I',
      instructor: 'Dr. Johnson',
      location: 'Room 202',
      duration: '50 minutes',
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    {
      id: 10,
      day: 'Tuesday',
      time: '9:00 AM - 9:50 AM',
      courseCode: 'CSE101',
      courseName: 'Introduction to Computer Science',
      instructor: 'Dr. Smith',
      location: 'Room 101',
      duration: '50 minutes',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    {
      id: 11,
      day: 'Tuesday',
      time: '10:00 AM - 10:50 AM',
      courseCode: 'ENG101',
      courseName: 'English Composition',
      instructor: 'Dr. Williams',
      location: 'Room 303',
      duration: '50 minutes',
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    {
      id: 12,
      day: 'Tuesday',
      time: '11:00 AM - 11:50 AM',
      courseCode: 'PHY101',
      courseName: 'Physics I',
      instructor: 'Dr. Brown',
      location: 'Room 404',
      duration: '50 minutes',
      color: 'bg-red-100 border-red-300 text-red-800'
    },
    {
      id: 13,
      day: 'Tuesday',
      time: '12:00 PM - 12:50 PM',
      courseCode: 'LUNCH',
      courseName: 'Lunch Break',
      instructor: 'N/A',
      location: 'Cafeteria',
      duration: '50 minutes',
      color: 'bg-orange-100 border-orange-300 text-orange-800'
    },
    {
      id: 14,
      day: 'Tuesday',
      time: '1:00 PM - 1:50 PM',
      courseCode: 'CHE101',
      courseName: 'Chemistry I',
      instructor: 'Dr. Davis',
      location: 'Lab 101',
      duration: '50 minutes',
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
    },
    {
      id: 15,
      day: 'Tuesday',
      time: '2:00 PM - 2:50 PM',
      courseCode: 'HIS101',
      courseName: 'World History',
      instructor: 'Dr. Wilson',
      location: 'Room 505',
      duration: '50 minutes',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    {
      id: 16,
      day: 'Tuesday',
      time: '3:00 PM - 3:50 PM',
      courseCode: 'FREE',
      courseName: 'Free Period',
      instructor: 'N/A',
      location: 'N/A',
      duration: '50 minutes',
      color: 'bg-gray-100 border-gray-300 text-gray-800'
    },

    // Wednesday - 8 periods
    {
      id: 17,
      day: 'Wednesday',
      time: '8:00 AM - 8:50 AM',
      courseCode: 'ENG101',
      courseName: 'English Composition',
      instructor: 'Dr. Williams',
      location: 'Room 303',
      duration: '50 minutes',
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    {
      id: 18,
      day: 'Wednesday',
      time: '9:00 AM - 9:50 AM',
      courseCode: 'MAT201',
      courseName: 'Calculus I',
      instructor: 'Dr. Johnson',
      location: 'Room 202',
      duration: '50 minutes',
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    {
      id: 19,
      day: 'Wednesday',
      time: '10:00 AM - 10:50 AM',
      courseCode: 'CSE101',
      courseName: 'Introduction to Computer Science',
      instructor: 'Dr. Smith',
      location: 'Room 101',
      duration: '50 minutes',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    {
      id: 20,
      day: 'Wednesday',
      time: '11:00 AM - 11:50 AM',
      courseCode: 'CHE101',
      courseName: 'Chemistry I',
      instructor: 'Dr. Davis',
      location: 'Lab 101',
      duration: '50 minutes',
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
    },
    {
      id: 21,
      day: 'Wednesday',
      time: '12:00 PM - 12:50 PM',
      courseCode: 'LUNCH',
      courseName: 'Lunch Break',
      instructor: 'N/A',
      location: 'Cafeteria',
      duration: '50 minutes',
      color: 'bg-orange-100 border-orange-300 text-orange-800'
    },
    {
      id: 22,
      day: 'Wednesday',
      time: '1:00 PM - 1:50 PM',
      courseCode: 'PHY101',
      courseName: 'Physics I',
      instructor: 'Dr. Brown',
      location: 'Room 404',
      duration: '50 minutes',
      color: 'bg-red-100 border-red-300 text-red-800'
    },
    {
      id: 23,
      day: 'Wednesday',
      time: '2:00 PM - 2:50 PM',
      courseCode: 'HIS101',
      courseName: 'World History',
      instructor: 'Dr. Wilson',
      location: 'Room 505',
      duration: '50 minutes',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    {
      id: 24,
      day: 'Wednesday',
      time: '3:00 PM - 3:50 PM',
      courseCode: 'FREE',
      courseName: 'Free Period',
      instructor: 'N/A',
      location: 'N/A',
      duration: '50 minutes',
      color: 'bg-gray-100 border-gray-300 text-gray-800'
    },

    // Thursday - 8 periods
    {
      id: 25,
      day: 'Thursday',
      time: '8:00 AM - 8:50 AM',
      courseCode: 'PHY101',
      courseName: 'Physics I',
      instructor: 'Dr. Brown',
      location: 'Room 404',
      duration: '50 minutes',
      color: 'bg-red-100 border-red-300 text-red-800'
    },
    {
      id: 26,
      day: 'Thursday',
      time: '9:00 AM - 9:50 AM',
      courseCode: 'ENG101',
      courseName: 'English Composition',
      instructor: 'Dr. Williams',
      location: 'Room 303',
      duration: '50 minutes',
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    {
      id: 27,
      day: 'Thursday',
      time: '10:00 AM - 10:50 AM',
      courseCode: 'MAT201',
      courseName: 'Calculus I',
      instructor: 'Dr. Johnson',
      location: 'Room 202',
      duration: '50 minutes',
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    {
      id: 28,
      day: 'Thursday',
      time: '11:00 AM - 11:50 AM',
      courseCode: 'CSE101',
      courseName: 'Introduction to Computer Science',
      instructor: 'Dr. Smith',
      location: 'Room 101',
      duration: '50 minutes',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    {
      id: 29,
      day: 'Thursday',
      time: '12:00 PM - 12:50 PM',
      courseCode: 'LUNCH',
      courseName: 'Lunch Break',
      instructor: 'N/A',
      location: 'Cafeteria',
      duration: '50 minutes',
      color: 'bg-orange-100 border-orange-300 text-orange-800'
    },
    {
      id: 30,
      day: 'Thursday',
      time: '1:00 PM - 1:50 PM',
      courseCode: 'HIS101',
      courseName: 'World History',
      instructor: 'Dr. Wilson',
      location: 'Room 505',
      duration: '50 minutes',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    {
      id: 31,
      day: 'Thursday',
      time: '2:00 PM - 2:50 PM',
      courseCode: 'CHE101',
      courseName: 'Chemistry I',
      instructor: 'Dr. Davis',
      location: 'Lab 101',
      duration: '50 minutes',
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
    },
    {
      id: 32,
      day: 'Thursday',
      time: '3:00 PM - 3:50 PM',
      courseCode: 'FREE',
      courseName: 'Free Period',
      instructor: 'N/A',
      location: 'N/A',
      duration: '50 minutes',
      color: 'bg-gray-100 border-gray-300 text-gray-800'
    },

    // Friday - 8 periods
    {
      id: 33,
      day: 'Friday',
      time: '8:00 AM - 8:50 AM',
      courseCode: 'CHE101',
      courseName: 'Chemistry I',
      instructor: 'Dr. Davis',
      location: 'Lab 101',
      duration: '50 minutes',
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
    },
    {
      id: 34,
      day: 'Friday',
      time: '9:00 AM - 9:50 AM',
      courseCode: 'PHY101',
      courseName: 'Physics I',
      instructor: 'Dr. Brown',
      location: 'Room 404',
      duration: '50 minutes',
      color: 'bg-red-100 border-red-300 text-red-800'
    },
    {
      id: 35,
      day: 'Friday',
      time: '10:00 AM - 10:50 AM',
      courseCode: 'ENG101',
      courseName: 'English Composition',
      instructor: 'Dr. Williams',
      location: 'Room 303',
      duration: '50 minutes',
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    {
      id: 36,
      day: 'Friday',
      time: '11:00 AM - 11:50 AM',
      courseCode: 'MAT201',
      courseName: 'Calculus I',
      instructor: 'Dr. Johnson',
      location: 'Room 202',
      duration: '50 minutes',
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    {
      id: 37,
      day: 'Friday',
      time: '12:00 PM - 12:50 PM',
      courseCode: 'LUNCH',
      courseName: 'Lunch Break',
      instructor: 'N/A',
      location: 'Cafeteria',
      duration: '50 minutes',
      color: 'bg-orange-100 border-orange-300 text-orange-800'
    },
    {
      id: 38,
      day: 'Friday',
      time: '1:00 PM - 1:50 PM',
      courseCode: 'CSE101',
      courseName: 'Introduction to Computer Science',
      instructor: 'Dr. Smith',
      location: 'Room 101',
      duration: '50 minutes',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    {
      id: 39,
      day: 'Friday',
      time: '2:00 PM - 2:50 PM',
      courseCode: 'HIS101',
      courseName: 'World History',
      instructor: 'Dr. Wilson',
      location: 'Room 505',
      duration: '50 minutes',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    {
      id: 40,
      day: 'Friday',
      time: '3:00 PM - 3:50 PM',
      courseCode: 'FREE',
      courseName: 'Free Period',
      instructor: 'N/A',
      location: 'N/A',
      duration: '50 minutes',
      color: 'bg-gray-100 border-gray-300 text-gray-800'
    }
  ]);

  // Enhanced filtered attendance with search and sort
  const filteredAttendance = useMemo(() => {
    let filtered = attendance;
    
    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(record => record.courseCode === selectedCourse);
    }
    
    // Month filter
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(record => {
        const recordMonth = new Date(record.date).getMonth();
        const selectedMonthNum = parseInt(selectedMonth);
        return recordMonth === selectedMonthNum;
      });
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'course':
          aValue = a.courseCode;
          bValue = b.courseCode;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [attendance, selectedCourse, selectedMonth, searchTerm, sortBy, sortOrder]);

  // Available courses and months
  const courses = useMemo(() => {
    const uniqueCourses = [...new Set(attendance.map(record => record.courseCode))];
    return ['all', ...uniqueCourses];
  }, [attendance]);

  const months = useMemo(() => {
    const uniqueMonths = [...new Set(attendance.map(record => {
      const date = new Date(record.date);
      return date.getMonth();
    }))];
    return ['all', ...uniqueMonths.map(month => month.toString())];
  }, [attendance]);

  // Enhanced color functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'absent':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'late':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'excused':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'excused':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50';
      case 'absent':
        return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:shadow-lg hover:shadow-red-100/50';
      case 'late':
        return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:shadow-lg hover:shadow-amber-100/50';
      case 'excused':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg hover:shadow-blue-100/50';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:shadow-lg hover:shadow-gray-100/50';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500 shadow-lg shadow-emerald-200';
      case 'absent':
        return 'bg-red-500 shadow-lg shadow-red-200';
      case 'late':
        return 'bg-amber-500 shadow-lg shadow-amber-200';
      case 'excused':
        return 'bg-blue-500 shadow-lg shadow-blue-200';
      default:
        return 'bg-gray-500 shadow-lg shadow-gray-200';
    }
  };

  // Calculate statistics
  const totalSessions = filteredAttendance.length;
  const presentSessions = filteredAttendance.filter(a => a.status === 'present').length;
  const absentSessions = filteredAttendance.filter(a => a.status === 'absent').length;
  const lateSessions = filteredAttendance.filter(a => a.status === 'late').length;
  const excusedSessions = filteredAttendance.filter(a => a.status === 'excused').length;
  const attendanceRate = totalSessions > 0 ? ((presentSessions + lateSessions + excusedSessions) / totalSessions * 100).toFixed(1) : '0';
  const punctualityRate = totalSessions > 0 ? (presentSessions / totalSessions * 100).toFixed(1) : '0';

  // Enhanced course-wise attendance
  const courseAttendance = useMemo(() => {
    return filteredAttendance.reduce((acc, record) => {
    if (!acc[record.courseCode]) {
      acc[record.courseCode] = {
        courseName: record.courseName,
        total: 0,
        present: 0,
        absent: 0,
          late: 0,
          excused: 0,
          instructor: record.instructor
      };
    }
    acc[record.courseCode].total++;
      if (record.status === 'present') acc[record.courseCode].present++;
      else if (record.status === 'absent') acc[record.courseCode].absent++;
      else if (record.status === 'late') acc[record.courseCode].late++;
      else if (record.status === 'excused') acc[record.courseCode].excused++;
    return acc;
    }, {} as Record<string, { 
      total: number; present: number; absent: number; late: number; excused: number; 
      courseName: string; instructor: string 
    }>);
  }, [filteredAttendance]);

  // Enhanced weekly trends
  const weeklyTrends = useMemo(() => {
    const weeks: Record<string, { total: number; present: number; absent: number; late: number; excused: number }> = {};
    filteredAttendance.forEach(record => {
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
      }
      weeks[weekKey].total++;
      if (record.status === 'present') weeks[weekKey].present++;
      else if (record.status === 'absent') weeks[weekKey].absent++;
      else if (record.status === 'late') weeks[weekKey].late++;
      else if (record.status === 'excused') weeks[weekKey].excused++;
    });
    
    return Object.entries(weeks).map(([week, data]) => ({
      week,
      ...data,
      rate: ((data.present + data.late + data.excused) / data.total * 100).toFixed(1),
      punctuality: (data.present / data.total * 100).toFixed(1)
    })).sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
  }, [filteredAttendance]);

  // Enhanced export functionality
  const exportAttendance = () => {
    if (!canEditTimetable) return;
    
    const csvContent = [
      ['Course Code', 'Course Name', 'Date', 'Time', 'Status', 'Instructor', 'Location', 'Duration', 'Notes', 'Semester'],
      ...filteredAttendance.map(record => [
        record.courseCode,
        record.courseName,
        record.date,
        record.time,
        record.status,
        record.instructor,
        record.location,
        record.duration,
        record.notes,
        record.semester
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${user?.firstName}-${user?.lastName}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Enhanced print functionality
  const printAttendance = () => {
    if (!canEditTimetable) return;
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Attendance Report - ${user?.firstName} ${user?.lastName}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 30px;
              border-radius: 10px;
            }
            .header h1 { 
              color: #1e40af; 
              margin-bottom: 10px; 
              font-size: 2.5em;
              font-weight: bold;
            }
            .header h2 { 
              color: #059669; 
              margin: 5px 0;
              font-size: 1.5em;
            }
            .stats { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin-bottom: 30px; 
            }
            .stat-card { 
              border: 2px solid #e5e7eb; 
              padding: 20px; 
              text-align: center; 
              border-radius: 10px;
              background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .stat-card h3 { 
              margin-bottom: 10px; 
              color: #374151;
              font-size: 1.1em;
            }
            .stat-value { 
              font-size: 2em; 
              font-weight: bold; 
              color: #1f2937;
            }
            .attendance-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 0.9em;
            }
            .attendance-table th {
              background: #2563eb;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            .attendance-table td {
              padding: 10px;
              border-bottom: 1px solid #e5e7eb;
            }
            .attendance-table tr:nth-child(even) {
              background: #f9fafb;
            }
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 0.8em;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-present { background: #dcfce7; color: #166534; }
            .status-absent { background: #fecaca; color: #991b1b; }
            .status-late { background: #fef3c7; color: #92400e; }
            .status-excused { background: #dbeafe; color: #1e40af; }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              font-size: 0.9em; 
              color: #6b7280; 
            }
            @media print {
              body { margin: 15px; font-size: 12px; }
              .header { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎓 ATTENDANCE REPORT</h1>
            <h2>${user?.firstName} ${user?.lastName}</h2>
            <p><strong>Student ID:</strong> ${user?.studentId}</p>
            <p><strong>Course Filter:</strong> ${selectedCourse === 'all' ? 'All Courses' : selectedCourse}</p>
            <p><strong>Period:</strong> ${selectedMonth === 'all' ? 'All Time' : new Date(2024, parseInt(selectedMonth)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <h3>📈 Overall Attendance</h3>
              <div class="stat-value" style="color: #059669;">${attendanceRate}%</div>
            </div>
            <div class="stat-card">
              <h3>✅ Present</h3>
              <div class="stat-value" style="color: #059669;">${presentSessions}</div>
            </div>
            <div class="stat-card">
              <h3>❌ Absent</h3>
              <div class="stat-value" style="color: #dc2626;">${absentSessions}</div>
            </div>
            <div class="stat-card">
              <h3>⏰ Late</h3>
              <div class="stat-value" style="color: #d97706;">${lateSessions}</div>
            </div>
            <div class="stat-card">
              <h3>🎯 Punctuality</h3>
              <div class="stat-value" style="color: #2563eb;">${punctualityRate}%</div>
            </div>
          </div>
          
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">📋 Detailed Attendance Records</h3>
          <table class="attendance-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Instructor</th>
                <th>Location</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAttendance.map(record => `
                <tr>
                  <td><strong>${record.courseCode}</strong><br><small>${record.courseName}</small></td>
                  <td>${new Date(record.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</td>
                  <td>${record.time}</td>
                  <td><span class="status-badge status-${record.status}">${record.status}</span></td>
                  <td>${record.instructor}</td>
                  <td>${record.location}</td>
                  <td>${record.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p><strong>🏛️ University ERP System</strong></p>
            <p>This is an official attendance report generated on ${new Date().toLocaleDateString()}.</p>
            <p><em>For academic use only. Please contact the registrar's office for any discrepancies.</em></p>
          </div>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  const handleSort = (field: 'date' | 'course' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Timetable helper functions
  const getDayColor = (day: string) => {
    switch (day) {
      case 'Monday':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'Tuesday':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'Wednesday':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'Thursday':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'Friday':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'Saturday':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'Sunday':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleEditSlot = (slot: TimetableSlot) => {
    if (!canEditTimetable) return;
    setEditingSlot(slot);
    setIsEditingTimetable(true);
  };

  const handleDeleteSlot = (id: number) => {
    if (!canEditTimetable) return;
    setTimetable(prev => prev.filter(slot => slot.id !== id));
  };

  const handleSaveSlot = (updatedSlot: TimetableSlot) => {
    if (!canEditTimetable) return;
    
    if (editingSlot) {
      setTimetable(prev => prev.map(slot => 
        slot.id === editingSlot.id ? updatedSlot : slot
      ));
    } else {
      setTimetable(prev => [...prev, { ...updatedSlot, id: Date.now() }]);
    }
    setEditingSlot(null);
    setIsEditingTimetable(false);
    setShowAddSlot(false);
  };

  const handleAddSlot = () => {
    if (!canEditTimetable) return;
    setEditingSlot(null);
    setShowAddSlot(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-6">
        <div className="flex justify-center">
            <div className="relative">
              <div className="p-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/25">
                <Calendar className="h-16 w-16 text-white" />
        </div>
              <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Attendance Dashboard
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Welcome back, <span className="font-semibold text-indigo-600">{user?.firstName}!</span> 
              Track your academic journey with comprehensive attendance insights.
            </p>
          </div>
      </div>

        {/* Role-based Access Control */}
        <RoleBasedAccess allowedRoles={['student', 'teacher', 'admin']} showAlert={true}>
          {/* Content for all authenticated users */}
          <div className="space-y-4">
            {/* Student View - Read Only */}
            {user?.role === 'student' && (
              <Alert className="border-blue-200 bg-blue-50">
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  You are viewing attendance in read-only mode. Only administrators can mark or modify attendance records.
                </AlertDescription>
              </Alert>
            )}

            {/* Teacher View - Limited Access */}
            {user?.role === 'teacher' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You can view attendance records but cannot modify them. Contact an administrator for attendance changes.
                </AlertDescription>
              </Alert>
            )}

            {/* Admin View - Full Access */}
            {user?.role === 'admin' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You have full administrative access to mark, modify, and manage all attendance records.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </RoleBasedAccess>

        {/* Enhanced Filters and Controls */}
        <Card className="border-0 shadow-xl bg-slate-50/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search courses, instructors, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-100/50 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger className="w-48 bg-slate-100/50">
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course} value={course}>
                            {course === 'all' ? '🎯 All Courses' : `📚 ${course}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32 bg-slate-100/50">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>
                          {month === 'all' ? 'All' : new Date(2024, parseInt(month)).toLocaleDateString('en-US', { month: 'short' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <AdminOnly fallback={null} showAlert={false}>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportAttendance} className="bg-slate-100/50 hover:bg-slate-200">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" onClick={printAttendance} className="bg-slate-100/50 hover:bg-slate-200">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </AdminOnly>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-50/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="timetable" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Timetable
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
              <div>
                      <p className="text-3xl font-bold">{attendanceRate}%</p>
                      <p className="text-indigo-100">Overall Rate</p>
              </div>
                    <TrendingUp className="h-10 w-10 text-indigo-200" />
            </div>
                  <Progress value={parseFloat(attendanceRate)} className="mt-3 bg-slate-100/20" />
          </CardContent>
        </Card>
              
              <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
              <div>
                      <p className="text-3xl font-bold">{presentSessions}</p>
                      <p className="text-emerald-100">Present</p>
              </div>
                    <CheckCircle className="h-10 w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
              
              <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-pink-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
              <div>
                      <p className="text-3xl font-bold">{absentSessions}</p>
                      <p className="text-red-100">Absent</p>
              </div>
                    <XCircle className="h-10 w-10 text-red-200" />
            </div>
          </CardContent>
        </Card>
              
              <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
              <div>
                      <p className="text-3xl font-bold">{lateSessions}</p>
                      <p className="text-amber-100">Late</p>
              </div>
                    <Clock className="h-10 w-10 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{punctualityRate}%</p>
                      <p className="text-purple-100">Punctuality</p>
                    </div>
                    <Target className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

            {/* Enhanced Course-wise Attendance */}
            <Card className="border-0 shadow-xl bg-slate-50/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <BookOpen className="h-6 w-6 text-indigo-500" />
                  Course Performance
                </CardTitle>
                <CardDescription>Detailed breakdown of attendance by course</CardDescription>
        </CardHeader>
              <CardContent className="p-6">
          <div className="space-y-4">
            {Object.entries(courseAttendance).map(([courseCode, data]) => {
                    const courseRate = ((data.present + data.late + data.excused) / data.total * 100).toFixed(1);
                    const coursePunctuality = (data.present / data.total * 100).toFixed(1);
                    
              return (
                      <div key={courseCode} className="group p-6 border rounded-xl hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                                <BookOpen className="h-5 w-5 text-white" />
                              </div>
                  <div>
                                <h3 className="text-lg font-bold text-slate-800">{courseCode}</h3>
                                <p className="text-slate-600 font-medium">{data.courseName}</p>
                  </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                              <User className="h-4 w-4" />
                              <span>Instructor: {data.instructor}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <p className="font-semibold text-emerald-600">{data.present}</p>
                                <p className="text-slate-500">Present</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-red-600">{data.absent}</p>
                                <p className="text-slate-500">Absent</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-amber-600">{data.late}</p>
                                <p className="text-slate-500">Late</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-blue-600">{data.excused}</p>
                                <p className="text-slate-500">Excused</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="space-y-2">
                              <div>
                                <p className="text-2xl font-bold text-slate-800">{courseRate}%</p>
                                <p className="text-sm text-slate-500">Attendance</p>
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-indigo-600">{coursePunctuality}%</p>
                                <p className="text-sm text-slate-500">Punctuality</p>
                              </div>
                              <div className="flex gap-1 justify-end">
                                <Badge className={`${parseFloat(courseRate) >= 90 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                  parseFloat(courseRate) >= 80 ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                  parseFloat(courseRate) >= 75 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                  'bg-red-100 text-red-700 border-red-200'}`}>
                                  {parseFloat(courseRate) >= 90 ? (
                                    <>
                                      <Star className="h-3 w-3 mr-1" />
                                      Excellent
                                    </>
                                  ) : parseFloat(courseRate) >= 80 ? (
                                    <>
                                      <Trophy className="h-3 w-3 mr-1" />
                                      Good
                                    </>
                                  ) : parseFloat(courseRate) >= 75 ? (
                                    <>
                                      <Target className="h-3 w-3 mr-1" />
                                      Average
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Needs Improvement
                                    </>
                                  )}
                    </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Progress value={parseFloat(courseRate)} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card className="border-0 shadow-xl bg-slate-50/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <FileText className="h-6 w-6 text-indigo-500" />
                      Attendance Records
                    </CardTitle>
                    <CardDescription>
                      Showing {filteredAttendance.length} of {attendance.length} records
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Sort by:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('date')}
                      className={sortBy === 'date' ? 'bg-indigo-100 text-indigo-700' : ''}
                    >
                      Date {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />)}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('course')}
                      className={sortBy === 'course' ? 'bg-indigo-100 text-indigo-700' : ''}
                    >
                      Course {sortBy === 'course' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />)}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('status')}
                      className={sortBy === 'status' ? 'bg-indigo-100 text-indigo-700' : ''}
                    >
                      Status {sortBy === 'status' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />)}
                    </Button>
                  </div>
                </div>
        </CardHeader>
              <CardContent className="p-6">
          <div className="space-y-4">
                  {filteredAttendance.map((record) => (
                    <div 
                      key={record.id} 
                      className={`group p-6 border rounded-xl transition-all duration-300 ${getStatusBackground(record.status)} hover:scale-[1.01]`}
                    >
                      <div className="flex items-center justify-between">
                <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${
                              record.status === 'present' ? 'bg-emerald-500' :
                              record.status === 'absent' ? 'bg-red-500' :
                              record.status === 'late' ? 'bg-amber-500' : 'bg-blue-500'
                            }`}>
                              <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800">
                                {record.courseCode} - {record.courseName}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {new Date(record.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {record.time} ({record.duration})
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {record.location}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-slate-600">
                              <User className="h-4 w-4" />
                              <span>Instructor: {record.instructor}</span>
                            </div>
                          </div>
                          {record.notes && (
                            <div className="mt-3 p-3 bg-slate-100/50 rounded-lg border">
                              <p className="text-sm">
                                <span className="font-medium text-slate-700">Note:</span> 
                                <span className="text-slate-600 ml-2">{record.notes}</span>
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 ml-6">
                          <Badge className={`${getStatusColor(record.status)} px-3 py-1 text-sm font-medium`}>
                      {getStatusIcon(record.status)}
                            <span className="ml-1">{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span>
                    </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setSelectedRecord(record)}
                            className="hover:bg-slate-100 hover:shadow-md transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                  </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Trends */}
              <Card className="border-0 shadow-xl bg-slate-50/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                  <CardTitle className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Weekly Performance
                  </CardTitle>
                  <CardDescription>Your attendance trends over time</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {weeklyTrends.map((week, index) => (
                      <div key={week.week} className="group p-4 border rounded-xl hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-slate-50">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <span className="font-semibold text-slate-800">
                              Week {index + 1}: {new Date(week.week).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <p className="text-sm text-slate-500">
                              {week.total} session{week.total !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${parseFloat(week.rate) >= 85 ? 'bg-emerald-100 text-emerald-700' : 
                              parseFloat(week.rate) >= 75 ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'}`}>
                              {week.rate}%
                            </Badge>
                            <p className="text-xs text-slate-500 mt-1">
                              Punctuality: {week.punctuality}%
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs text-slate-600 mb-2">
                          <span className="text-emerald-600">Present: {week.present}</span>
                          <span className="text-red-600">Absent: {week.absent}</span>
                          <span className="text-amber-600">Late: {week.late}</span>
                          <span className="text-blue-600">Excused: {week.excused}</span>
                        </div>
                        <div className="space-y-1">
                          <Progress value={parseFloat(week.rate)} className="h-2" />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

              {/* Performance Insights */}
              <Card className="border-0 shadow-xl bg-slate-50/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                  <CardTitle className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-indigo-500" />
                    Performance Analytics
                  </CardTitle>
                  <CardDescription>Insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Attendance Goal */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-800 mb-1">Attendance Target</h4>
                        <p className="text-sm text-blue-700 mb-2">
                          Goal: 85% • Current: {attendanceRate}%
                        </p>
                        <Progress value={Math.min(parseFloat(attendanceRate) / 85 * 100, 100)} className="h-2" />
                        <p className="text-xs text-blue-600 mt-1">
                          {parseFloat(attendanceRate) >= 85 ? '🎉 Goal achieved!' : `${(85 - parseFloat(attendanceRate)).toFixed(1)}% to go`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Status */}
                  <div className={`p-4 rounded-xl border ${
                    parseFloat(attendanceRate) >= 90 ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' :
                    parseFloat(attendanceRate) >= 80 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' :
                    parseFloat(attendanceRate) >= 75 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' :
                    'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        parseFloat(attendanceRate) >= 90 ? 'bg-emerald-500' :
                        parseFloat(attendanceRate) >= 80 ? 'bg-blue-500' :
                        parseFloat(attendanceRate) >= 75 ? 'bg-amber-500' : 'bg-red-500'
                      }`}>
                        {parseFloat(attendanceRate) >= 90 ? <Star className="h-5 w-5 text-white" /> :
                         parseFloat(attendanceRate) >= 80 ? <Trophy className="h-5 w-5 text-white" /> :
                         parseFloat(attendanceRate) >= 75 ? <TrendingUp className="h-5 w-5 text-white" /> :
                         <AlertTriangle className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <h4 className={`font-semibold mb-1 ${
                          parseFloat(attendanceRate) >= 90 ? 'text-emerald-800' :
                          parseFloat(attendanceRate) >= 80 ? 'text-blue-800' :
                          parseFloat(attendanceRate) >= 75 ? 'text-amber-800' : 'text-red-800'
                        }`}>
                          {parseFloat(attendanceRate) >= 90 ? 'Outstanding Performance!' :
                           parseFloat(attendanceRate) >= 80 ? 'Good Attendance Record' :
                           parseFloat(attendanceRate) >= 75 ? 'Room for Improvement' : 'Attention Required'}
                        </h4>
                        <p className={`text-sm ${
                          parseFloat(attendanceRate) >= 90 ? 'text-emerald-700' :
                          parseFloat(attendanceRate) >= 80 ? 'text-blue-700' :
                          parseFloat(attendanceRate) >= 75 ? 'text-amber-700' : 'text-red-700'
                        }`}>
                          {parseFloat(attendanceRate) >= 90 ? 'Keep up the excellent work! You\'re exceeding expectations.' :
                           parseFloat(attendanceRate) >= 80 ? 'You\'re meeting academic requirements well.' :
                           parseFloat(attendanceRate) >= 75 ? 'Consider improving attendance to secure better grades.' :
                           'Immediate attention needed to meet academic requirements.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Punctuality Analysis */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-1">Punctuality Insights</h4>
                        <p className="text-sm text-purple-700">
                          {lateSessions === 0 ? 'Perfect punctuality record!' :
                           lateSessions === 1 ? '1 late arrival recorded.' :
                           `${lateSessions} late arrivals recorded. Consider arriving 10-15 minutes early.`}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Punctuality Rate: {punctualityRate}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Recommendations
                    </h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      {parseFloat(attendanceRate) < 85 && (
                        <p>• Focus on maintaining consistent attendance to improve your rate</p>
                      )}
                      {lateSessions > 2 && (
                        <p>• Plan to arrive 10-15 minutes early to avoid late arrivals</p>
                      )}
                      {absentSessions > 3 && (
                        <p>• Consider setting calendar reminders for important classes</p>
                      )}
                      <p>• Keep up regular communication with instructors</p>
                      <p>• Review attendance policy for each course</p>
                    </div>
                  </div>
          </CardContent>
        </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="border-0 shadow-xl bg-slate-50/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <CardTitle className="flex items-center gap-3">
                  <CalendarDays className="h-6 w-6 text-indigo-500" />
                  Attendance Calendar
                </CardTitle>
                <CardDescription>Visual representation of your attendance patterns</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Enhanced Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-8 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getStatusDotColor('present')}`}></div>
                    <span className="text-sm font-medium text-emerald-700">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getStatusDotColor('absent')}`}></div>
                    <span className="text-sm font-medium text-red-700">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getStatusDotColor('late')}`}></div>
                    <span className="text-sm font-medium text-amber-700">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getStatusDotColor('excused')}`}></div>
                    <span className="text-sm font-medium text-blue-700">Excused</span>
                  </div>
                </div>
                
                {/* Enhanced Calendar Grid */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <div key={day} className="text-center font-bold text-sm p-3 text-slate-700 bg-slate-50 rounded-lg">
                        {day.slice(0, 3)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 42 }, (_, i) => {
                      const date = new Date(2024, 11, 1 - new Date(2024, 11, 1).getDay() + i);
                      const isCurrentMonth = date.getMonth() === 11;
                      const dateStr = date.toISOString().split('T')[0];
                      const dayAttendance = filteredAttendance.filter(record => record.date === dateStr);
                      const isToday = new Date().toDateString() === date.toDateString();
                      
                      return (
                        <div 
                          key={i} 
                          className={`min-h-[80px] p-2 border rounded-lg text-center text-sm transition-all duration-200 hover:shadow-md ${
                            isCurrentMonth ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 text-slate-400'
                          } ${isToday ? 'ring-2 ring-indigo-300 bg-indigo-50' : ''}`}
                        >
                          <div className={`font-semibold mb-2 ${isToday ? 'text-indigo-600' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                            {date.getDate()}
                          </div>
                          <div className="flex flex-col gap-1">
                            {dayAttendance.map(record => (
                              <div 
                                key={record.id} 
                                className={`w-6 h-6 mx-auto rounded-full shadow-sm transition-all duration-200 hover:scale-110 cursor-pointer ${getStatusDotColor(record.status)}`}
                                title={`${record.courseCode} - ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}\n${record.time} at ${record.location}`}
                                onClick={() => setSelectedRecord(record)}
                              >
                                <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center">
                                  {record.status === 'present' && <CheckCircle className="h-3 w-3 text-white" />}
                                  {record.status === 'absent' && <XCircle className="h-3 w-3 text-white" />}
                                  {record.status === 'late' && <Clock className="h-3 w-3 text-white" />}
                                </div>
                              </div>
                            ))}
                          </div>
                          {dayAttendance.length > 1 && (
                            <div className="text-xs text-slate-500 mt-1">
                              +{dayAttendance.length - 1} more
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable" className="space-y-6">
            <Card className="border-0 shadow-xl bg-slate-50/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-indigo-500" />
                      Weekly Timetable
                    </CardTitle>
                    <CardDescription>Your class schedule with edit functionality</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <AdminOnly fallback={null} showAlert={false}>
                      <Button 
                        variant="outline" 
                        onClick={handleAddSlot}
                        className="bg-slate-100/50 hover:bg-slate-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Class
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => canEditTimetable && setIsEditingTimetable(!isEditingTimetable)}
                      disabled={!canEditTimetable}
                        className="bg-slate-100/50 hover:bg-slate-200"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditingTimetable ? 'Done Editing' : 'Edit Timetable'}
                      </Button>
                    </AdminOnly>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <div key={day} className="space-y-3">
                      <div className={`p-3 rounded-lg border-2 text-center font-semibold ${getDayColor(day)}`}>
                        {day}
                      </div>
                      <div className="space-y-2">
                        {timetable
                          .filter(slot => slot.day === day)
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map(slot => (
                            <div 
                              key={slot.id} 
                              className={`p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${slot.color}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm">{slot.courseCode}</h4>
                                  <p className="text-xs opacity-80">{slot.courseName}</p>
                                </div>
                                {isEditingTimetable && (
                                  <AdminOnly fallback={null} showAlert={false}>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditSlot(slot)}
                                        className="h-6 w-6 p-0 hover:bg-slate-100/50"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteSlot(slot.id)}
                                        className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </AdminOnly>
                                )}
                              </div>
                              <div className="space-y-1 text-xs">
                                <p className="font-medium">{slot.time}</p>
                                <p className="opacity-80">{slot.instructor}</p>
                                <p className="opacity-80">{slot.location}</p>
                                <p className="opacity-80">{slot.duration}</p>
                              </div>
                            </div>
                          ))}
                        {timetable.filter(slot => slot.day === day).length === 0 && (
                          <div className="p-3 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-500 text-sm">
                            No classes
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Attendance Details Dialog */}
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-2xl border-0 shadow-2xl">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className={`p-2 rounded-lg ${
                  selectedRecord?.status === 'present' ? 'bg-emerald-500' :
                  selectedRecord?.status === 'absent' ? 'bg-red-500' :
                  selectedRecord?.status === 'late' ? 'bg-amber-500' : 'bg-blue-500'
                }`}>
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                Attendance Record Details
              </DialogTitle>
              <DialogDescription className="text-base">
                Complete information about this attendance session
              </DialogDescription>
            </DialogHeader>
            
            {selectedRecord && (
              <div className="space-y-6 pt-4">
                {/* Course Information */}
                <div className={`p-6 rounded-xl border-2 ${getStatusBackground(selectedRecord.status)}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        {selectedRecord.courseCode} - {selectedRecord.courseName}
                      </h3>
                      <p className="text-slate-600 font-medium">{selectedRecord.semester}</p>
                    </div>
                    <Badge className={`${getStatusColor(selectedRecord.status)} px-4 py-2 text-sm font-semibold`}>
                      {getStatusIcon(selectedRecord.status)}
                      <span className="ml-2">{selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}</span>
                    </Badge>
                  </div>
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/70 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-700">Date & Time</span>
                      </div>
                      <p className="text-slate-800 font-semibold">
                        {new Date(selectedRecord.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-slate-600">{selectedRecord.time}</p>
                    </div>
                    
                    <div className="p-4 bg-white/70 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-700">Duration</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{selectedRecord.duration}</p>
                    </div>
                    
                    <div className="p-4 bg-white/70 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-700">Location</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{selectedRecord.location}</p>
                    </div>
                    
                    <div className="p-4 bg-white/70 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-700">Instructor</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{selectedRecord.instructor}</p>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedRecord.notes && (
                  <div className="p-4 bg-slate-100/50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="font-medium text-slate-700">Additional Notes</span>
                    </div>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded border italic">
                      "{selectedRecord.notes}"
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      const recordData = [
                        ['Field', 'Value'],
                        ['Course Code', selectedRecord.courseCode],
                        ['Course Name', selectedRecord.courseName],
                        ['Date', new Date(selectedRecord.date).toLocaleDateString()],
                        ['Time', selectedRecord.time],
                        ['Duration', selectedRecord.duration],
                        ['Status', selectedRecord.status],
                        ['Instructor', selectedRecord.instructor],
                        ['Location', selectedRecord.location],
                        ['Notes', selectedRecord.notes || 'None']
                      ].map(row => row.join(',')).join('\n');
                      
                      const blob = new Blob([recordData], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `attendance-record-${selectedRecord.id}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Record
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Timetable Edit/Add Dialog */}
        <Dialog open={isEditingTimetable || showAddSlot} onOpenChange={() => {
          setIsEditingTimetable(false);
          setShowAddSlot(false);
          setEditingSlot(null);
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                {editingSlot ? 'Edit Class' : 'Add New Class'}
              </DialogTitle>
              <DialogDescription>
                {editingSlot ? 'Update the class details' : 'Add a new class to your timetable'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Day</label>
                  <Select 
                    value={editingSlot?.day || ''} 
                    onValueChange={(value) => setEditingSlot(prev => prev ? {...prev, day: value} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input 
                    placeholder="10:00 AM - 11:15 AM"
                    value={editingSlot?.time || ''}
                    onChange={(e) => setEditingSlot(prev => prev ? {...prev, time: e.target.value} : null)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Course Code</label>
                <Input 
                  placeholder="CS101"
                  value={editingSlot?.courseCode || ''}
                  onChange={(e) => setEditingSlot(prev => prev ? {...prev, courseCode: e.target.value} : null)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Course Name</label>
                <Input 
                  placeholder="Introduction to Computer Science"
                  value={editingSlot?.courseName || ''}
                  onChange={(e) => setEditingSlot(prev => prev ? {...prev, courseName: e.target.value} : null)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Instructor</label>
                <Input 
                  placeholder="Dr. Smith"
                  value={editingSlot?.instructor || ''}
                  onChange={(e) => setEditingSlot(prev => prev ? {...prev, instructor: e.target.value} : null)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input 
                    placeholder="Room 101"
                    value={editingSlot?.location || ''}
                    onChange={(e) => setEditingSlot(prev => prev ? {...prev, location: e.target.value} : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <Input 
                    placeholder="75 minutes"
                    value={editingSlot?.duration || ''}
                    onChange={(e) => setEditingSlot(prev => prev ? {...prev, duration: e.target.value} : null)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Color Theme</label>
                <Select 
                  value={editingSlot?.color || ''} 
                  onValueChange={(value) => setEditingSlot(prev => prev ? {...prev, color: value} : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-blue-100 border-blue-300 text-blue-800">Blue</SelectItem>
                    <SelectItem value="bg-green-100 border-green-300 text-green-800">Green</SelectItem>
                    <SelectItem value="bg-purple-100 border-purple-300 text-purple-800">Purple</SelectItem>
                    <SelectItem value="bg-orange-100 border-orange-300 text-orange-800">Orange</SelectItem>
                    <SelectItem value="bg-red-100 border-red-300 text-red-800">Red</SelectItem>
                    <SelectItem value="bg-indigo-100 border-indigo-300 text-indigo-800">Indigo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditingTimetable(false);
                  setShowAddSlot(false);
                  setEditingSlot(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (editingSlot) {
                    handleSaveSlot(editingSlot);
                  } else if (showAddSlot) {
                    const newSlot: TimetableSlot = {
                      id: Date.now(),
                      day: 'Monday',
                      time: '',
                      courseCode: '',
                      courseName: '',
                      instructor: '',
                      location: '',
                      duration: '',
                      color: 'bg-blue-100 border-blue-300 text-blue-800'
                    };
                    handleSaveSlot(newSlot);
                  }
                }}
                disabled={!editingSlot?.day || !editingSlot?.time || !editingSlot?.courseCode}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingSlot ? 'Update' : 'Add Class'}
              </Button>
            </div>
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

export default Attendance; 
