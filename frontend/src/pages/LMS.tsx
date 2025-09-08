import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import CourseMaterials from '@/components/LMS/CourseMaterials';
import QuizSystem from '@/components/LMS/QuizSystem';
import DiscussionForum from '@/components/LMS/DiscussionForum';
import ProgressTracking from '@/components/LMS/ProgressTracking';
import {
  BookOpen,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Award,
  BarChart3,
  Play,
  Download,
  Upload,
  Settings
} from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  description: string;
  credits: number;
  instructor: string;
  semester: string;
  year: number;
  schedule: string;
  room: string;
  maxStudents: number;
  currentEnrollment: number;
  createdAt: string;
}

const LMS: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('materials');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  React.useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data.data);
      } else {
        throw new Error('Failed to fetch course');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
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

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-400">The requested course could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <Badge variant="outline">{course.courseCode}</Badge>
              </div>
              <CardDescription className="text-base">
                {course.description}
              </CardDescription>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.currentEnrollment}/{course.maxStudents} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{course.credits} credits</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{course.semester} {course.year}</span>
                </div>
                {course.schedule && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.schedule}</span>
                  </div>
                )}
                {course.room && (
                  <div className="flex items-center gap-1">
                    <span>Room: {course.room}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isTeacher && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Course
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate('/courses')}>
                Back to Courses
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* LMS Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-6">
          <CourseMaterials />
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6">
          <QuizSystem />
        </TabsContent>

        <TabsContent value="discussions" className="mt-6">
          <DiscussionForum />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <ProgressTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LMS;
