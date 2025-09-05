import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Building2,
  UserCheck,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalStudents?: number;
  totalFaculty?: number;
  totalStaff?: number;
  totalFeesCollected?: number;
  pendingFees?: number;
  totalUsers?: number;
  departmentStudents?: number;
  departmentFaculty?: number;
  departmentCourses?: number;
  assignedStudents?: number;
  assignedCourses?: number;
  enrolledCourses?: number;
  attendancePercentage?: number;
  branch?: string;
  course?: string;
}

interface Activity {
  type: string;
  message: string;
  timestamp: string;
  data: any;
}

interface Notification {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔍 Dashboard: Starting to fetch data...');
      console.log('🔍 Dashboard: Token exists:', !!token);
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('🔍 Dashboard: API Base URL:', API_BASE_URL);

      const [overviewRes, activitiesRes, notificationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/dashboard/recent-activities`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/dashboard/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('🔍 Dashboard: Overview response:', overviewRes.status, overviewRes.ok);
      console.log('🔍 Dashboard: Activities response:', activitiesRes.status, activitiesRes.ok);
      console.log('🔍 Dashboard: Notifications response:', notificationsRes.status, notificationsRes.ok);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        console.log('🔍 Dashboard: Overview data:', overviewData);
        setStats(overviewData.data.stats);
      } else {
        console.error('🔍 Dashboard: Overview failed:', await overviewRes.text());
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        console.log('🔍 Dashboard: Activities data:', activitiesData);
        setActivities(activitiesData.data.activities);
      } else {
        console.error('🔍 Dashboard: Activities failed:', await activitiesRes.text());
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        console.log('🔍 Dashboard: Notifications data:', notificationsData);
        setNotifications(notificationsData.data.notifications);
      } else {
        console.error('🔍 Dashboard: Notifications failed:', await notificationsRes.text());
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrator',
      'hod': 'Head of Department',
      'faculty': 'Faculty Member',
      'student': 'Student',
      'staff': 'Staff Member'
    };
    return roleMap[role] || role;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <FileText className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'success': return 'border-green-200 bg-green-50 text-green-800';
      default: return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            {getRoleDisplayName(user?.role || '')} Dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {user?.role?.toUpperCase()}
          </Badge>
          {user?.branch && (
            <Badge variant="secondary" className="text-sm">
              {user.branch}
            </Badge>
          )}
          {user?.course && (
            <Badge variant="secondary" className="text-sm">
              {user.course}
            </Badge>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>User Role:</strong> {user?.role || 'None'}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
            <p><strong>Stats:</strong> {Object.keys(stats).length} properties</p>
            <p><strong>Activities:</strong> {activities.length} items</p>
            <p><strong>Notifications:</strong> {notifications.length} items</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'admin' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Enrolled students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFaculty || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Teaching staff
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fees Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalFeesCollected || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.pendingFees || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Outstanding amount
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {user?.role === 'hod' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Department Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.departmentStudents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.branch} students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Department Faculty</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.departmentFaculty || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.branch} faculty
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Department Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.departmentCourses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.branch} courses
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {user?.role === 'faculty' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.assignedStudents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.course} students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.assignedCourses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.branch} courses
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {user?.role === 'student' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enrolledCourses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Current enrollments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.attendancePercentage || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Overall attendance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.pendingFees || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Outstanding amount
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Current status and key metrics for {getRoleDisplayName(user?.role || '')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Branch</p>
                    <p className="text-sm text-muted-foreground">{user?.branch || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Course</p>
                    <p className="text-sm text-muted-foreground">{user?.course || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest updates and activities in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activities</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications & Alerts</CardTitle>
              <CardDescription>
                Important updates and system alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <Alert key={index} className={getNotificationColor(notification.type)}>
                      {getNotificationIcon(notification.type)}
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm">{notification.message}</p>
                          </div>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              View Courses
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Check Schedule
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
