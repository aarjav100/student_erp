import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  BookOpen,
  FileText,
  Award,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Timer,
  Bookmark,
  Zap
} from 'lucide-react';

interface ProgressData {
  progress: {
    _id: string;
    studentId: string;
    courseId: string;
    materialProgress: MaterialProgress[];
    assignmentProgress: AssignmentProgress[];
    quizProgress: QuizProgress[];
    overallProgress: number;
    totalTimeSpent: number;
    lastActivity: string;
    streak: number;
    badges: Badge[];
    achievements: Achievement[];
  };
  course: {
    id: string;
    title: string;
    courseCode: string;
  };
  summary: {
    overallProgress: number;
    totalTimeSpent: number;
    lastActivity: string;
    streak: number;
    badges: Badge[];
    achievements: Achievement[];
  };
  details: {
    materials: {
      total: number;
      completed: number;
      inProgress: number;
      notStarted: number;
    };
    assignments: {
      total: number;
      submitted: number;
      graded: number;
      notStarted: number;
    };
    quizzes: {
      total: number;
      completed: number;
      attempted: number;
      notStarted: number;
    };
  };
}

interface MaterialProgress {
  materialId: {
    _id: string;
    title: string;
    type: string;
  };
  status: 'not-started' | 'in-progress' | 'completed';
  progressPercentage: number;
  timeSpent: number;
  lastAccessed: string;
  completedAt?: string;
}

interface AssignmentProgress {
  assignmentId: {
    _id: string;
    title: string;
    type: string;
    dueDate: string;
  };
  status: 'not-started' | 'in-progress' | 'submitted' | 'graded';
  submittedAt?: string;
  grade?: string;
  score?: number;
  maxScore?: number;
  feedback?: string;
}

interface QuizProgress {
  quizId: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  attempts: number;
  bestScore: number;
  bestPercentage: number;
  lastAttempt?: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface Badge {
  name: string;
  description: string;
  earnedAt: string;
  icon: string;
}

interface Achievement {
  name: string;
  description: string;
  earnedAt: string;
  points: number;
}

const ProgressTracking: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (courseId) {
      fetchProgress();
    }
  }, [courseId]);

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
        setProgressData(data.data);
      } else {
        throw new Error('Failed to fetch progress');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'submitted':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'graded':
        return <Award className="h-4 w-4 text-purple-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'graded':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No progress data</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No progress data available for this course.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning progress in {progressData.course.title}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressData.summary.overallProgress}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Progress 
              value={progressData.summary.overallProgress} 
              className="mt-4"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTimeSpent(progressData.summary.totalTimeSpent)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Timer className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Last activity: {formatDate(progressData.summary.lastActivity)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressData.summary.streak} days
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Keep it up!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Achievements</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressData.summary.achievements.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {progressData.summary.badges.length} badges earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progress Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Materials</span>
                    <span>{progressData.details.materials.completed}/{progressData.details.materials.total}</span>
                  </div>
                  <Progress 
                    value={(progressData.details.materials.completed / progressData.details.materials.total) * 100} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Assignments</span>
                    <span>{progressData.details.assignments.submitted}/{progressData.details.assignments.total}</span>
                  </div>
                  <Progress 
                    value={(progressData.details.assignments.submitted / progressData.details.assignments.total) * 100} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Quizzes</span>
                    <span>{progressData.details.quizzes.completed}/{progressData.details.quizzes.total}</span>
                  </div>
                  <Progress 
                    value={(progressData.details.quizzes.completed / progressData.details.quizzes.total) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progressData.summary.achievements.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No achievements yet</p>
                ) : (
                  <div className="space-y-3">
                    {progressData.summary.achievements.slice(0, 5).map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          +{achievement.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Material Progress
              </CardTitle>
              <CardDescription>
                Track your progress through course materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.progress.materialProgress.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No materials accessed yet</p>
              ) : (
                <div className="space-y-4">
                  {progressData.progress.materialProgress.map((material, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getStatusIcon(material.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{material.materialId.title}</p>
                        <p className="text-xs text-gray-500">{material.materialId.type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(material.status)}>
                          {material.status.replace('-', ' ')}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{material.progressPercentage}%</p>
                          <p className="text-xs text-gray-500">{formatTimeSpent(material.timeSpent)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assignment Progress
              </CardTitle>
              <CardDescription>
                Track your assignment submissions and grades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.progress.assignmentProgress.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No assignments yet</p>
              ) : (
                <div className="space-y-4">
                  {progressData.progress.assignmentProgress.map((assignment, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getStatusIcon(assignment.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{assignment.assignmentId.title}</p>
                        <p className="text-xs text-gray-500">
                          Due: {formatDate(assignment.assignmentId.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('-', ' ')}
                        </Badge>
                        {assignment.grade && (
                          <Badge variant="outline">
                            {assignment.grade}
                          </Badge>
                        )}
                        {assignment.score !== undefined && (
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {assignment.score}/{assignment.maxScore}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Quiz Progress
              </CardTitle>
              <CardDescription>
                Track your quiz attempts and scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.progress.quizProgress.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No quizzes attempted yet</p>
              ) : (
                <div className="space-y-4">
                  {progressData.progress.quizProgress.map((quiz, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getStatusIcon(quiz.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{quiz.quizId.title}</p>
                        <p className="text-xs text-gray-500">
                          {quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(quiz.status)}>
                          {quiz.status.replace('-', ' ')}
                        </Badge>
                        {quiz.bestPercentage > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{quiz.bestPercentage}%</p>
                            <p className="text-xs text-gray-500">Best Score</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTracking;
