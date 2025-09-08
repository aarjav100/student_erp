import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Calendar,
  FileText,
  Award,
  MessageSquare,
  BookOpen,
  Users,
  Settings,
  Trash2,
  MarkAsRead,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  _id: string;
  recipientId: string;
  senderId?: {
    _id: string;
    name: string;
    email: string;
  };
  courseId?: {
    _id: string;
    title: string;
    courseCode: string;
  };
  title: string;
  message: string;
  type: 'assignment-due' | 'assignment-graded' | 'quiz-available' | 'quiz-graded' | 'announcement' | 'discussion-reply' | 'course-material' | 'enrollment-approved' | 'enrollment-rejected' | 'deadline-reminder' | 'grade-update' | 'attendance-alert' | 'payment-due' | 'system' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    assignmentId?: string;
    quizId?: string;
    discussionId?: string;
    materialId?: string;
    gradeId?: string;
    dueDate?: string;
    score?: number;
    maxScore?: number;
  };
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, { total: number; unread: number }>;
  byPriority: Record<string, { total: number; unread: number }>;
}

const NotificationSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [currentPage, filterType, filterPriority]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (filterType !== 'all') params.append('type', filterType);
      if (filterPriority !== 'all') params.append('priority', filterPriority);

      const response = await fetch(`${API_BASE_URL}/lms/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setTotalPages(data.data.pagination.pages);
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/notifications/stats`, {
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
      console.error('Error fetching notification stats:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          )
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/notifications/${notificationId}/unread`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: false, readAt: undefined }
              : notification
          )
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true, readAt: new Date().toISOString() }))
        );
        fetchStats(); // Refresh stats
        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
        fetchStats(); // Refresh stats
        toast({
          title: "Success",
          description: "Notification deleted",
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment-due':
      case 'assignment-graded':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'quiz-available':
      case 'quiz-graded':
        return <Award className="h-5 w-5 text-green-500" />;
      case 'announcement':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'discussion-reply':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'course-material':
        return <BookOpen className="h-5 w-5 text-indigo-500" />;
      case 'enrollment-approved':
      case 'enrollment-rejected':
        return <Users className="h-5 w-5 text-teal-500" />;
      case 'deadline-reminder':
        return <Clock className="h-5 w-5 text-red-500" />;
      case 'grade-update':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'attendance-alert':
        return <Calendar className="h-5 w-5 text-pink-500" />;
      case 'payment-due':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment-due':
      case 'assignment-graded':
        return 'bg-blue-100 text-blue-800';
      case 'quiz-available':
      case 'quiz-graded':
        return 'bg-green-100 text-green-800';
      case 'announcement':
        return 'bg-orange-100 text-orange-800';
      case 'discussion-reply':
        return 'bg-purple-100 text-purple-800';
      case 'course-material':
        return 'bg-indigo-100 text-indigo-800';
      case 'enrollment-approved':
      case 'enrollment-rejected':
        return 'bg-teal-100 text-teal-800';
      case 'deadline-reminder':
        return 'bg-red-100 text-red-800';
      case 'grade-update':
        return 'bg-yellow-100 text-yellow-800';
      case 'attendance-alert':
        return 'bg-pink-100 text-pink-800';
      case 'payment-due':
        return 'bg-red-100 text-red-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'read') return notification.isRead;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">Stay updated with your academic activities</p>
        </div>
        {stats && stats.unread > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(stats.byPriority.high?.unread || 0) + (stats.byPriority.urgent?.unread || 0)}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assignments</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(stats.byType['assignment-due']?.unread || 0) + (stats.byType['assignment-graded']?.unread || 0)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {stats && stats.unread > 0 && (
              <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                {stats.unread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="assignment-due">Assignment Due</option>
              <option value="assignment-graded">Assignment Graded</option>
              <option value="quiz-available">Quiz Available</option>
              <option value="quiz-graded">Quiz Graded</option>
              <option value="announcement">Announcement</option>
              <option value="discussion-reply">Discussion Reply</option>
              <option value="course-material">Course Material</option>
              <option value="deadline-reminder">Deadline Reminder</option>
              <option value="grade-update">Grade Update</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {activeTab === 'unread' 
                    ? 'You have no unread notifications.' 
                    : activeTab === 'read'
                    ? 'You have no read notifications.'
                    : 'You have no notifications yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification._id} 
                  className={`hover:shadow-md transition-shadow ${
                    !notification.isRead ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`font-semibold text-lg ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={getTypeColor(notification.type)}>
                                {notification.type.replace('-', ' ')}
                              </Badge>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              {notification.courseId && (
                                <Badge variant="outline">
                                  {notification.courseId.courseCode}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              {notification.senderId && (
                                <span>From: {notification.senderId.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {notification.actionUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.href = notification.actionUrl!}
                              >
                                {notification.actionText || 'View'}
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.isRead ? (
                                  <DropdownMenuItem onClick={() => markAsRead(notification._id)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => markAsUnread(notification._id)}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Mark as Unread
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => deleteNotification(notification._id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSystem;
