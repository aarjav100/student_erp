import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText,
  Video,
  Image,
  Music,
  Download,
  Eye,
  Upload,
  Search,
  Filter,
  BookOpen,
  File,
  Presentation,
  Book,
  Play,
  Clock,
  User,
  Calendar,
  Tag,
  MoreVertical,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CourseMaterial {
  _id: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  tags: string[];
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MaterialProgress {
  materialId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progressPercentage: number;
  timeSpent: number;
  lastAccessed: string;
  completedAt?: string;
}

const CourseMaterials: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [progress, setProgress] = useState<MaterialProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (courseId) {
      fetchMaterials();
      fetchProgress();
    }
  }, [courseId, currentPage, searchTerm, filterType]);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('type', filterType);

      const response = await fetch(`${API_BASE_URL}/lms/materials/${courseId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data.data.materials);
        setTotalPages(data.data.pagination.pages);
      } else {
        throw new Error('Failed to fetch materials');
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Error",
        description: "Failed to load course materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/progress/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.data.progress.materialProgress || []);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const getMaterialIcon = (type: string, mimeType: string) => {
    if (type === 'video' || mimeType.startsWith('video/')) {
      return <Video className="h-5 w-5 text-red-500" />;
    } else if (type === 'lecture' || mimeType.includes('presentation')) {
      return <Presentation className="h-5 w-5 text-blue-500" />;
    } else if (type === 'ebook' || mimeType.includes('pdf')) {
      return <Book className="h-5 w-5 text-green-500" />;
    } else if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-purple-500" />;
    } else if (mimeType.startsWith('audio/')) {
      return <Music className="h-5 w-5 text-orange-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMaterialProgress = (materialId: string) => {
    return progress.find(p => p.materialId === materialId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleViewMaterial = async (material: CourseMaterial) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/materials/material/${material._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Open material in new tab or handle based on type
        if (material.type === 'video') {
          window.open(material.fileUrl, '_blank');
        } else {
          window.open(material.fileUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error viewing material:', error);
      toast({
        title: "Error",
        description: "Failed to open material",
        variant: "destructive",
      });
    }
  };

  const handleDownloadMaterial = async (material: CourseMaterial) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/materials/${material._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = material.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading material:', error);
      toast({
        title: "Error",
        description: "Failed to download material",
        variant: "destructive",
      });
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Materials</h1>
          <p className="text-gray-600 dark:text-gray-400">Access and manage your course materials</p>
        </div>
        {isTeacher && (
          <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Material
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search materials..."
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
            <SelectItem value="lecture">Lectures</SelectItem>
            <SelectItem value="notes">Notes</SelectItem>
            <SelectItem value="ppt">Presentations</SelectItem>
            <SelectItem value="ebook">E-books</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No materials found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {searchTerm || filterType !== 'all' 
                ? 'No materials match your search criteria.' 
                : 'No materials have been uploaded yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => {
            const materialProgress = getMaterialProgress(material._id);
            return (
              <Card key={material._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getMaterialIcon(material.type, material.mimeType)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {material.type}
                          </Badge>
                          {material.duration && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDuration(material.duration)}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewMaterial(material)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadMaterial(material)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {material.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                  
                  {/* Progress */}
                  {materialProgress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">
                          {materialProgress.progressPercentage}%
                        </span>
                      </div>
                      <Progress value={materialProgress.progressPercentage} className="h-2" />
                    </div>
                  )}

                  {/* Tags */}
                  {material.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {material.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {material.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{material.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {material.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {material.downloadCount}
                      </span>
                    </div>
                    <span className="text-xs">
                      {formatFileSize(material.fileSize)}
                    </span>
                  </div>

                  {/* Uploaded by */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {material.uploadedBy.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      • {new Date(material.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
    </div>
  );
};

export default CourseMaterials;
