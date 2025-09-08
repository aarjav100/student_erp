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
import { Switch } from '@/components/ui/switch';
import { 
  Bell,
  Send,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Mail,
  MessageSquare,
  AlertTriangle,
  Info,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'announcement' | 'reminder' | 'alert' | 'deadline' | 'event' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'students' | 'teachers' | 'admins' | 'specific';
  targetUsers?: Array<{
    userId: string;
    name: string;
    email: string;
  }>;
  targetCourses?: Array<{
    courseId: string;
    courseCode: string;
    title: string;
  }>;
  targetSubjects?: Array<{
    subjectId: string;
    code: string;
    name: string;
  }>;
  scheduledFor?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  links?: Array<{
    title: string;
    url: string;
  }>;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  totalRecipients: number;
  readCount: number;
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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  program?: string;
}

interface NotificationStats {
  totalNotifications: number;
  sentNotifications: number;
  scheduledNotifications: number;
  draftNotifications: number;
  totalRecipients: number;
  averageReadRate: number;
  notificationsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    status: string;
  }>;
}

const NotificationsManagement: React.FC = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isCreateNotificationDialogOpen, setIsCreateNotificationDialogOpen] = useState(false);
  const [isViewNotificationDialogOpen, setIsViewNotificationDialogOpen] = useState(false);
  const [isEditNotificationDialogOpen, setIsEditNotificationDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Form states
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'announcement' as const,
    priority: 'medium' as const,
    targetAudience: 'all' as const,
    targetUserIds: [] as string[],
    targetCourseIds: [] as string[],
    targetSubjectIds: [] as string[],
    scheduledFor: '',
    isScheduled: false,
    links: [] as Array<{title: string, url: string}>
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    targetAudience: '',
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
        fetchNotifications(),
        fetchCourses(),
        fetchSubjects(),
        fetchUsers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
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

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
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

  const handleSendNotification = async () => {
    try {
      const formData = new FormData();
      formData.append('title', notificationForm.title);
      formData.append('message', notificationForm.message);
      formData.append('type', notificationForm.type);
      formData.append('priority', notificationForm.priority);
      formData.append('targetAudience', notificationForm.targetAudience);
      formData.append('targetUserIds', JSON.stringify(notificationForm.targetUserIds));
      formData.append('targetCourseIds', JSON.stringify(notificationForm.targetCourseIds));
      formData.append('targetSubjectIds', JSON.stringify(notificationForm.targetSubjectIds));
      formData.append('links', JSON.stringify(notificationForm.links));
      formData.append('isScheduled', notificationForm.isScheduled.toString());
      
      if (notificationForm.isScheduled && notificationForm.scheduledFor) {
        formData.append('scheduledFor', notificationForm.scheduledFor);
      }

      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: notificationForm.isScheduled ? "Notification scheduled successfully" : "Notification sent successfully",
        });
        setIsCreateNotificationDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNotificationForm({
      title: '',
      message: '',
      type: 'announcement',
      priority: 'medium',
      targetAudience: 'all',
      targetUserIds: [],
      targetCourseIds: [],
      targetSubjectIds: [],
      scheduledFor: '',
      isScheduled: false,
      links: []
    });
    setAttachments([]);
    setNewLink({ title: '', url: '' });
  };

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setNotificationForm({
        ...notificationForm,
        links: [...notificationForm.links, newLink]
      });
      setNewLink({ title: '', url: '' });
    }
  };

  const removeLink = (index: number) => {
    setNotificationForm({
      ...notificationForm,
      links: notificationForm.links.filter((_, i) => i !== index)
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'deadline': return 'bg-orange-100 text-orange-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'deadline': return <Calendar className="h-4 w-4" />;
      case 'event': return <Star className="h-4 w-4" />;
      case 'system': return <Zap className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
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
          <h2 className="text-3xl font-bold text-gray-900">Notifications Management</h2>
          <p className="text-gray-600">Send announcements, reminders, and alerts to students and teachers</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateNotificationDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Send className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sentNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.scheduledNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Read Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageReadRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest notification activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-1 rounded-full bg-gray-100">
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </Badge>
                    </div>
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
              <Label htmlFor="type-filter">Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="system">System</SelectItem>
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
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="audience-filter">Target Audience</Label>
              <Select value={filters.targetAudience} onValueChange={(value) => setFilters({...filters, targetAudience: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Audiences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Audiences</SelectItem>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                  <SelectItem value="admins">Admins</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>View and manage all notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Notification</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Priority</th>
                  <th className="text-left p-4">Target</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Read Rate</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.sentAt ? 
                            `Sent: ${new Date(notification.sentAt).toLocaleString()}` :
                            notification.scheduledFor ?
                            `Scheduled: ${new Date(notification.scheduledFor).toLocaleString()}` :
                            `Created: ${new Date(notification.createdAt).toLocaleString()}`
                          }
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <Badge className={`${getTypeColor(notification.type)} capitalize`}>
                          {notification.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getPriorityColor(notification.priority)} capitalize`}>
                        {notification.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium capitalize">{notification.targetAudience}</p>
                        <p className="text-xs text-gray-500">{notification.totalRecipients} recipients</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(notification.status)} capitalize`}>
                        {notification.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{notification.readCount}/{notification.totalRecipients}</p>
                        <p className="text-xs text-gray-500">
                          {notification.totalRecipients > 0 ? 
                            `${((notification.readCount / notification.totalRecipients) * 100).toFixed(1)}%` : 
                            '0%'
                          }
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setIsViewNotificationDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {notification.status === 'draft' && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
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

      {/* Create Notification Dialog */}
      <Dialog open={isCreateNotificationDialogOpen} onOpenChange={setIsCreateNotificationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>Create and send notifications to students and teachers</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={notificationForm.type} onValueChange={(value: any) => setNotificationForm({...notificationForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                placeholder="Enter notification message"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={notificationForm.priority} onValueChange={(value: any) => setNotificationForm({...notificationForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Select value={notificationForm.targetAudience} onValueChange={(value: any) => setNotificationForm({...notificationForm, targetAudience: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                    <SelectItem value="specific">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Specific Target Selection */}
            {notificationForm.targetAudience === 'specific' && (
              <div>
                <Label>Select Specific Users</Label>
                <div className="max-h-32 overflow-y-auto border rounded p-2">
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={user._id}
                        checked={notificationForm.targetUserIds.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNotificationForm({
                              ...notificationForm,
                              targetUserIds: [...notificationForm.targetUserIds, user._id]
                            });
                          } else {
                            setNotificationForm({
                              ...notificationForm,
                              targetUserIds: notificationForm.targetUserIds.filter(id => id !== user._id)
                            });
                          }
                        }}
                      />
                      <label htmlFor={user._id} className="text-sm">
                        {user.name} ({user.email}) - {user.role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course/Subject Selection */}
            {(notificationForm.targetAudience === 'students' || notificationForm.targetAudience === 'all') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Courses (Optional)</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2">
                    {courses.map((course) => (
                      <div key={course._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`course-${course._id}`}
                          checked={notificationForm.targetCourseIds.includes(course._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNotificationForm({
                                ...notificationForm,
                                targetCourseIds: [...notificationForm.targetCourseIds, course._id]
                              });
                            } else {
                              setNotificationForm({
                                ...notificationForm,
                                targetCourseIds: notificationForm.targetCourseIds.filter(id => id !== course._id)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`course-${course._id}`} className="text-sm">
                          {course.courseCode} - {course.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Target Subjects (Optional)</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2">
                    {subjects.map((subject) => (
                      <div key={subject._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`subject-${subject._id}`}
                          checked={notificationForm.targetSubjectIds.includes(subject._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNotificationForm({
                                ...notificationForm,
                                targetSubjectIds: [...notificationForm.targetSubjectIds, subject._id]
                              });
                            } else {
                              setNotificationForm({
                                ...notificationForm,
                                targetSubjectIds: notificationForm.targetSubjectIds.filter(id => id !== subject._id)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`subject-${subject._id}`} className="text-sm">
                          {subject.code} - {subject.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Scheduling */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-scheduled"
                  checked={notificationForm.isScheduled}
                  onCheckedChange={(checked) => setNotificationForm({...notificationForm, isScheduled: checked})}
                />
                <Label htmlFor="is-scheduled">Schedule for later</Label>
              </div>
              {notificationForm.isScheduled && (
                <div>
                  <Label htmlFor="scheduled-for">Schedule Date & Time</Label>
                  <Input
                    id="scheduled-for"
                    type="datetime-local"
                    value={notificationForm.scheduledFor}
                    onChange={(e) => setNotificationForm({...notificationForm, scheduledFor: e.target.value})}
                  />
                </div>
              )}
            </div>

            {/* File Attachments */}
            <div>
              <Label htmlFor="attachments">File Attachments (Optional)</Label>
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
                      <FileText className="h-4 w-4 text-gray-500" />
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
              <Label>External Links (Optional)</Label>
              <div className="space-y-2">
                {notificationForm.links.map((link, index) => (
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateNotificationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification}>
              {notificationForm.isScheduled ? 'Schedule Notification' : 'Send Notification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Notification Dialog */}
      <Dialog open={isViewNotificationDialogOpen} onOpenChange={setIsViewNotificationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>View detailed notification information</DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Notification Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Title:</span> {selectedNotification.title}</p>
                    <p><span className="font-medium">Type:</span> 
                      <Badge className={`ml-2 ${getTypeColor(selectedNotification.type)}`}>
                        {selectedNotification.type}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Priority:</span> 
                      <Badge className={`ml-2 ${getPriorityColor(selectedNotification.priority)}`}>
                        {selectedNotification.priority}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Target Audience:</span> {selectedNotification.targetAudience}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedNotification.status)}`}>
                        {selectedNotification.status}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Total Recipients:</span> {selectedNotification.totalRecipients}</p>
                    <p><span className="font-medium">Read Count:</span> {selectedNotification.readCount}</p>
                    <p><span className="font-medium">Read Rate:</span> 
                      {selectedNotification.totalRecipients > 0 ? 
                        `${((selectedNotification.readCount / selectedNotification.totalRecipients) * 100).toFixed(1)}%` : 
                        '0%'
                      }
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Timing Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Created:</span> {new Date(selectedNotification.createdAt).toLocaleString()}</p>
                    <p><span className="font-medium">Created By:</span> {selectedNotification.createdBy.name}</p>
                    {selectedNotification.sentAt && (
                      <p><span className="font-medium">Sent At:</span> {new Date(selectedNotification.sentAt).toLocaleString()}</p>
                    )}
                    {selectedNotification.scheduledFor && (
                      <p><span className="font-medium">Scheduled For:</span> {new Date(selectedNotification.scheduledFor).toLocaleString()}</p>
                    )}
                    <p><span className="font-medium">Last Updated:</span> {new Date(selectedNotification.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Message</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>

              {selectedNotification.targetUsers && selectedNotification.targetUsers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Target Users</h3>
                  <div className="space-y-2">
                    {selectedNotification.targetUsers.map((user, index) => (
                      <div key={index} className="p-2 border rounded">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNotification.targetCourses && selectedNotification.targetCourses.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Target Courses</h3>
                  <div className="space-y-2">
                    {selectedNotification.targetCourses.map((course, index) => (
                      <div key={index} className="p-2 border rounded">
                        <p className="font-medium">{course.courseCode}</p>
                        <p className="text-sm text-gray-600">{course.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNotification.targetSubjects && selectedNotification.targetSubjects.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Target Subjects</h3>
                  <div className="space-y-2">
                    {selectedNotification.targetSubjects.map((subject, index) => (
                      <div key={index} className="p-2 border rounded">
                        <p className="font-medium">{subject.code}</p>
                        <p className="text-sm text-gray-600">{subject.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNotification.attachments && selectedNotification.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedNotification.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
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

              {selectedNotification.links && selectedNotification.links.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">External Links</h3>
                  <div className="space-y-2">
                    {selectedNotification.links.map((link, index) => (
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

              {selectedNotification.readBy && selectedNotification.readBy.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Read By ({selectedNotification.readBy.length} users)</h3>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedNotification.readBy.map((read, index) => {
                      const user = users.find(u => u._id === read.userId);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span>{user?.name || 'Unknown User'}</span>
                          <span className="text-gray-500">{new Date(read.readAt).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewNotificationDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsManagement;
