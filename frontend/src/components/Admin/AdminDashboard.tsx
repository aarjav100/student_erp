import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Calendar,
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  UserCheck,
  FileText,
  Award,
  Bell,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalAssignments: number;
  pendingApprovals: number;
  averageAttendance: number;
  averageGrades: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  attendanceTrend: Array<{
    date: string;
    percentage: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    type: 'assignment' | 'exam' | 'project';
    dueDate: string;
    course: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        // Mock data for development
        setStats({
          totalStudents: 1250,
          totalTeachers: 45,
          totalCourses: 28,
          totalAssignments: 156,
          pendingApprovals: 12,
          averageAttendance: 87.5,
          averageGrades: 82.3,
          recentActivity: [
            {
              id: '1',
              type: 'enrollment',
              message: 'New student enrollment request from John Doe',
              timestamp: '2 hours ago',
              priority: 'medium'
            },
            {
              id: '2',
              type: 'assignment',
              message: 'Assignment deadline approaching for CS101',
              timestamp: '4 hours ago',
              priority: 'high'
            },
            {
              id: '3',
              type: 'attendance',
              message: 'Daily attendance marked for 15 classes',
              timestamp: '6 hours ago',
              priority: 'low'
            }
          ],
          attendanceTrend: [
            { date: '2024-01-01', percentage: 85 },
            { date: '2024-01-02', percentage: 87 },
            { date: '2024-01-03', percentage: 89 },
            { date: '2024-01-04', percentage: 86 },
            { date: '2024-01-05', percentage: 88 }
          ],
          gradeDistribution: [
            { grade: 'A+', count: 45, percentage: 15 },
            { grade: 'A', count: 78, percentage: 26 },
            { grade: 'B+', count: 89, percentage: 30 },
            { grade: 'B', count: 56, percentage: 19 },
            { grade: 'C', count: 32, percentage: 10 }
          ],
          upcomingDeadlines: [
            {
              id: '1',
              title: 'Database Design Assignment',
              type: 'assignment',
              dueDate: '2024-01-15',
              course: 'CS301'
            },
            {
              id: '2',
              title: 'Midterm Exam',
              type: 'exam',
              dueDate: '2024-01-18',
              course: 'MATH201'
            },
            {
              id: '3',
              title: 'Web Development Project',
              type: 'project',
              dueDate: '2024-01-20',
              course: 'CS401'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <UserCheck className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'attendance': return <Calendar className="h-4 w-4" />;
      case 'grade': return <Award className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getDeadlineIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'exam': return <BookOpen className="h-4 w-4" />;
      case 'project': return <Award className="h-4 w-4" />;
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDashboardStats} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">Overview of your ERP system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTeachers}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2 new this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.averageAttendance}%</p>
                <div className="mt-2">
                  <Progress value={stats?.averageAttendance} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Grades</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.averageGrades}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3.1% improvement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalAssignments}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Last 5 days attendance percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.attendanceTrend.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={day.percentage} className="w-24 h-2" />
                    <span className="text-sm font-medium w-12 text-right">
                      {day.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Current semester grade breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.gradeDistribution.map((grade, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{grade.grade}</Badge>
                    <span className="text-sm text-gray-600">{grade.count} students</span>
                  </div>
                  <span className="text-sm font-medium">{grade.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-1 rounded-full bg-gray-100">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      <Badge className={`text-xs ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-1 rounded-full bg-blue-100">
                    {getDeadlineIcon(deadline.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{deadline.course}</span>
                      <span className="text-xs text-blue-600">
                        Due: {new Date(deadline.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Mark Attendance</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Award className="h-6 w-6" />
              <span className="text-sm">Enter Grades</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Create Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Bell className="h-6 w-6" />
              <span className="text-sm">Send Notification</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
