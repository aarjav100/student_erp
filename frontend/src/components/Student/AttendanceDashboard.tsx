import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Clock,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  BookOpen,
  Users,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceRecord {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    courseCode: string;
    department: string;
    degree: string;
  };
  subjectId?: {
    _id: string;
    name: string;
    code: string;
  };
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
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  leaveDays: number;
  attendancePercentage: number;
}

interface CourseStats {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  totalDays: number;
  presentDays: number;
  attendancePercentage: number;
}

const AttendanceDashboard: React.FC = () => {
  const { toast } = useToast();
  const { token, user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [overallStats, setOverallStats] = useState<AttendanceStats | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    courseId: '',
    startDate: '',
    endDate: '',
    semester: '',
    year: ''
  });

  const [selectedPeriod, setSelectedPeriod] = useState('month'); // day, week, month, semester

  useEffect(() => {
    fetchAttendanceData();
  }, [filters, selectedPeriod]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_BASE_URL}/attendance/student/${user?.id}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.data.attendance);
        setOverallStats(data.data.statistics);
        
        // Calculate course-wise stats
        const courseStatsMap = new Map<string, CourseStats>();
        
        data.data.attendance.forEach((record: AttendanceRecord) => {
          const courseId = record.courseId._id;
          if (!courseStatsMap.has(courseId)) {
            courseStatsMap.set(courseId, {
              courseId,
              courseCode: record.courseId.courseCode,
              courseTitle: record.courseId.title,
              totalDays: 0,
              presentDays: 0,
              attendancePercentage: 0
            });
          }
          
          const stats = courseStatsMap.get(courseId)!;
          stats.totalDays++;
          if (record.status === 'present') {
            stats.presentDays++;
          }
        });

        // Calculate percentages
        courseStatsMap.forEach(stats => {
          stats.attendancePercentage = stats.totalDays > 0 ? 
            Math.round((stats.presentDays / stats.totalDays) * 100) : 0;
        });

        setCourseStats(Array.from(courseStatsMap.values()));
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      case 'leave': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAttendanceTrend = () => {
    if (!overallStats) return 'neutral';
    if (overallStats.attendancePercentage >= 90) return 'excellent';
    if (overallStats.attendancePercentage >= 75) return 'good';
    if (overallStats.attendancePercentage >= 60) return 'average';
    return 'poor';
  };

  const getTrendIcon = () => {
    const trend = getAttendanceTrend();
    switch (trend) {
      case 'excellent': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'good': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'average': return <Activity className="h-5 w-5 text-yellow-600" />;
      case 'poor': return <TrendingDown className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    const trend = getAttendanceTrend();
    switch (trend) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
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
          <h2 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h2>
          <p className="text-gray-600">Track your attendance and academic progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Stats Cards */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50/60 dark:bg-blue-900/40 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Overall Attendance</p>
                  <p className={`text-3xl font-bold ${getTrendColor()} dark:text-white`}>
                    {overallStats.attendancePercentage}%
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon()}
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {overallStats.presentDays} of {overallStats.totalDays} days
                    </span>
                  </div>
                </div>
                <div className="ml-4 rounded-full bg-white/70 dark:bg-white/10 p-2 ring-2 ring-blue-200 dark:ring-blue-700">
                  <Progress
                    value={overallStats.attendancePercentage}
                    className="w-16 h-16"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/60 dark:bg-green-900/40 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-700 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Present Days</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.presentDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/60 dark:bg-red-900/40 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-700 dark:text-red-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Absent Days</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.absentDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/60 dark:bg-yellow-900/40 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-700 dark:text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Late Days</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.lateDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Course-wise Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Course-wise Attendance</CardTitle>
          <CardDescription>Your attendance performance across different courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseStats.map((course) => (
              <div key={course.courseId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{course.courseCode} - {course.courseTitle}</h3>
                  <p className="text-sm text-gray-600">
                    {course.presentDays} of {course.totalDays} days attended
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{course.attendancePercentage}%</p>
                    <Progress 
                      value={course.attendancePercentage} 
                      className="w-24 h-2 mt-1"
                    />
                  </div>
                  <Badge 
                    className={`${
                      course.attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                      course.attendancePercentage >= 75 ? 'bg-blue-100 text-blue-800' :
                      course.attendancePercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {course.attendancePercentage >= 90 ? 'Excellent' :
                     course.attendancePercentage >= 75 ? 'Good' :
                     course.attendancePercentage >= 60 ? 'Average' : 'Poor'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="course-filter">Course</Label>
              <Select value={filters.courseId || '__all__'} onValueChange={(value) => setFilters({...filters, courseId: value === '__all__' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Courses</SelectItem>
                  {courseStats.map((course) => (
                    <SelectItem key={course.courseId} value={course.courseId}>
                      {course.courseCode} - {course.courseTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="semester-filter">Semester</Label>
              <Select value={filters.semester || '__all__'} onValueChange={(value) => setFilters({...filters, semester: value === '__all__' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Semesters</SelectItem>
                  <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                  <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                  <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year-filter">Year</Label>
              <Select value={filters.year || '__all__'} onValueChange={(value) => setFilters({...filters, year: value === '__all__' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Detailed view of your attendance history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceRecords.map((record) => (
              <div key={record._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{record.courseId.courseCode}</h3>
                      {record.subjectId && (
                        <span className="text-sm text-gray-500">• {record.subjectId.code}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {record.courseId.title}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{new Date(record.date).toLocaleDateString()}</span>
                      {record.checkInTime && (
                        <span>Check-in: {new Date(record.checkInTime).toLocaleTimeString()}</span>
                      )}
                      {record.isLate && (
                        <span className="text-yellow-600">Late by {record.lateMinutes} min</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={`${getStatusColor(record.status)} flex items-center gap-1`}>
                    {getStatusIcon(record.status)}
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                  {record.notes && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Notes:</p>
                      <p className="text-sm text-gray-700 max-w-32 truncate">{record.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {attendanceRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No attendance records found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceDashboard;
