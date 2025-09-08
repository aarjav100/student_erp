import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Pin,
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Bookmark
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Discussion {
  _id: string;
  title: string;
  content: string;
  type: 'question' | 'announcement' | 'general' | 'assignment-help' | 'exam-help';
  author: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
  upvotes: {
    user: string;
    createdAt: string;
  }[];
  downvotes: {
    user: string;
    createdAt: string;
  }[];
  views: number;
  replies: DiscussionReply[];
  createdAt: string;
  updatedAt: string;
}

interface DiscussionReply {
  _id: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  content: string;
  isSolution: boolean;
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
  upvotes: {
    user: string;
    createdAt: string;
  }[];
  downvotes: {
    user: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const DiscussionForum: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);

  // Form states
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    type: 'general' as const,
    tags: ''
  });
  const [newReply, setNewReply] = useState({
    content: '',
    isSolution: false
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (courseId) {
      fetchDiscussions();
    }
  }, [courseId, currentPage, searchTerm, filterType, sortBy, sortOrder]);

  const fetchDiscussions = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('type', filterType);

      const response = await fetch(`${API_BASE_URL}/lms/discussions/${courseId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.data.discussions);
        setTotalPages(data.data.pagination.pages);
      } else {
        throw new Error('Failed to fetch discussions');
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to load discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/discussions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          ...newDiscussion
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Discussion created successfully",
        });
        setShowCreateModal(false);
        setNewDiscussion({ title: '', content: '', type: 'general', tags: '' });
        fetchDiscussions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create discussion');
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create discussion",
        variant: "destructive",
      });
    }
  };

  const handleAddReply = async () => {
    if (!selectedDiscussion) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/discussions/${selectedDiscussion._id}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReply),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reply added successfully",
        });
        setShowReplyModal(false);
        setNewReply({ content: '', isSolution: false });
        fetchDiscussions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add reply",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (discussionId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/discussions/${discussionId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-500';
      case 'announcement': return 'bg-red-500';
      case 'assignment-help': return 'bg-green-500';
      case 'exam-help': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return '❓';
      case 'announcement': return '📢';
      case 'assignment-help': return '📝';
      case 'exam-help': return '📚';
      default: return '💬';
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

  const isTeacher = ['teacher', 'admin', 'faculty', 'professor'].includes(user?.role || '');

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discussion Forum</h1>
          <p className="text-gray-600 dark:text-gray-400">Ask questions and discuss course topics</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Discussion</DialogTitle>
              <DialogDescription>
                Start a new discussion topic for your course.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter discussion title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={newDiscussion.type} onValueChange={(value: any) => setNewDiscussion(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Discussion</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="assignment-help">Assignment Help</SelectItem>
                    <SelectItem value="exam-help">Exam Help</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your discussion content"
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={newDiscussion.tags}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., homework, chapter1, difficult"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDiscussion}>
                  Create Discussion
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="question">Questions</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="assignment-help">Assignment Help</SelectItem>
            <SelectItem value="exam-help">Exam Help</SelectItem>
          </SelectContent>
        </Select>
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [field, order] = value.split('-');
          setSortBy(field);
          setSortOrder(order);
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="views-desc">Most Viewed</SelectItem>
            <SelectItem value="replies-desc">Most Replies</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Discussions List */}
      {discussions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No discussions found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {searchTerm || filterType !== 'all' 
                ? 'No discussions match your search criteria.' 
                : 'No discussions have been created yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Card key={discussion._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {discussion.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                      {discussion.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                      <span className="text-lg">{getTypeIcon(discussion.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2 cursor-pointer hover:text-blue-600"
                        onClick={() => navigate(`/courses/${courseId}/discussions/${discussion._id}`)}
                      >
                        {discussion.title}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {discussion.content}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getTypeColor(discussion.type)} text-white`}>
                      {discussion.type.replace('-', ' ')}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Bookmark className="h-4 w-4 mr-2" />
                          Bookmark
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Flag className="h-4 w-4 mr-2" />
                          Report
                        </DropdownMenuItem>
                        {isTeacher && (
                          <>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Tags */}
                {discussion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {discussion.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {discussion.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTimeAgo(discussion.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {discussion.replies.length} replies
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {discussion.views} views
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Vote Buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(discussion._id, 'upvote')}
                        className="h-8 w-8 p-0"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[20px] text-center">
                        {discussion.upvotes.length - discussion.downvotes.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(discussion._id, 'downvote')}
                        className="h-8 w-8 p-0"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDiscussion(discussion);
                        setShowReplyModal(true);
                      }}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
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

      {/* Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Discussion</DialogTitle>
            <DialogDescription>
              {selectedDiscussion?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your Reply</label>
              <Textarea
                value={newReply.content}
                onChange={(e) => setNewReply(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your reply"
                rows={6}
              />
            </div>
            {isTeacher && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isSolution"
                  checked={newReply.isSolution}
                  onChange={(e) => setNewReply(prev => ({ ...prev, isSolution: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isSolution" className="text-sm font-medium">
                  Mark as solution
                </label>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReplyModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReply}>
                Post Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscussionForum;
