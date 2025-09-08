import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Award,
  Users,
  Calendar,
  FileText,
  Timer,
  Eye,
  BarChart3,
  Trophy,
  AlertCircle,
  BookOpen,
  Target
} from 'lucide-react';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  instructions: string;
  questions: QuizQuestion[];
  totalPoints: number;
  timeLimit: number;
  attemptsAllowed: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface QuizQuestion {
  _id: string;
  questionText: string;
  questionType: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  correctAnswer: string;
  points: number;
  explanation: string;
  order: number;
}

interface QuizAttempt {
  _id: string;
  quizId: string;
  studentId: string;
  answers: QuizAnswer[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  timeStarted: string;
  timeCompleted: string;
  timeSpent: number;
  status: 'in-progress' | 'completed' | 'abandoned' | 'timeout';
  attemptNumber: number;
  isGraded: boolean;
  feedback: string;
  createdAt: string;
}

interface QuizAnswer {
  questionId: string;
  answer: string;
  selectedOptions: string[];
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
}

const QuizSystem: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (courseId) {
      fetchQuizzes();
    }
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/quizzes/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data.quizzes);
      } else {
        throw new Error('Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAttempts = async (quizId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/quizzes/${quizId}/attempts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttempts(data.data);
      }
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
    }
  };

  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);

    if (now < startDate) {
      return { status: 'upcoming', color: 'bg-blue-500', text: 'Upcoming' };
    } else if (now > endDate) {
      return { status: 'completed', color: 'bg-gray-500', text: 'Completed' };
    } else {
      return { status: 'active', color: 'bg-green-500', text: 'Active' };
    }
  };

  const getQuizAttemptStatus = (quiz: Quiz) => {
    const userAttempts = attempts.filter(attempt => attempt.quizId === quiz._id);
    const completedAttempts = userAttempts.filter(attempt => attempt.status === 'completed');
    const inProgressAttempt = userAttempts.find(attempt => attempt.status === 'in-progress');

    if (inProgressAttempt) {
      return { status: 'in-progress', attempt: inProgressAttempt };
    } else if (completedAttempts.length >= quiz.attemptsAllowed) {
      return { status: 'max-attempts', attempts: completedAttempts };
    } else {
      return { status: 'available', attempts: completedAttempts };
    }
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lms/quizzes/${quiz._id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentAttempt(data.data);
        setSelectedQuiz(quiz);
        setShowQuizModal(true);
        toast({
          title: "Quiz Started",
          description: "Good luck with your quiz!",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start quiz');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start quiz",
        variant: "destructive",
      });
    }
  };

  const handleContinueQuiz = (quiz: Quiz, attempt: QuizAttempt) => {
    setCurrentAttempt(attempt);
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getBestScore = (quizId: string) => {
    const quizAttempts = attempts.filter(attempt => attempt.quizId === quizId);
    if (quizAttempts.length === 0) return null;
    
    const bestAttempt = quizAttempts.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
    
    return bestAttempt;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes & Tests</h1>
          <p className="text-gray-600 dark:text-gray-400">Take quizzes and track your performance</p>
        </div>
        {isTeacher && (
          <Button onClick={() => navigate(`/courses/${courseId}/quizzes/create`)}>
            <FileText className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {quizzes.filter(quiz => getQuizStatus(quiz).status === 'active').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No active quizzes</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  There are no quizzes available at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes
                .filter(quiz => getQuizStatus(quiz).status === 'active')
                .map((quiz) => {
                  const attemptStatus = getQuizAttemptStatus(quiz);
                  const bestScore = getBestScore(quiz._id);
                  
                  return (
                    <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {quiz.description}
                            </CardDescription>
                          </div>
                          <Badge className={`${getQuizStatus(quiz).color} text-white`}>
                            {getQuizStatus(quiz).text}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {/* Quiz Info */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <FileText className="h-4 w-4" />
                            {quiz.questions.length} questions
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Award className="h-4 w-4" />
                            {quiz.totalPoints} points
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Timer className="h-4 w-4" />
                            {formatDuration(quiz.timeLimit)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            {formatTimeRemaining(quiz.endDate)} remaining
                          </div>
                        </div>

                        {/* Best Score */}
                        {bestScore && (
                          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                Best Score
                              </span>
                              <span className="text-lg font-bold text-green-800 dark:text-green-200">
                                {bestScore.percentage}%
                              </span>
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              {bestScore.totalScore}/{bestScore.maxScore} points
                            </div>
                          </div>
                        )}

                        {/* Attempt Status */}
                        <div className="mb-4">
                          {attemptStatus.status === 'in-progress' && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Quiz in progress</span>
                              </div>
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                You have an ongoing attempt. Click continue to resume.
                              </p>
                            </div>
                          )}
                          
                          {attemptStatus.status === 'max-attempts' && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">All attempts used</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {attemptStatus.attempts?.length}/{quiz.attemptsAllowed} attempts completed
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {attemptStatus.status === 'available' && (
                            <Button 
                              onClick={() => handleStartQuiz(quiz)}
                              className="flex-1"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Quiz
                            </Button>
                          )}
                          
                          {attemptStatus.status === 'in-progress' && attemptStatus.attempt && (
                            <Button 
                              onClick={() => handleContinueQuiz(quiz, attemptStatus.attempt)}
                              className="flex-1"
                              variant="outline"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Continue
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline"
                            onClick={() => {
                              fetchQuizAttempts(quiz._id);
                              // Show results modal
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Created by */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>{quiz.createdBy.name}</span>
                          <span>•</span>
                          <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {quizzes.filter(quiz => getQuizStatus(quiz).status === 'completed').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No completed quizzes</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  You haven't completed any quizzes yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes
                .filter(quiz => getQuizStatus(quiz).status === 'completed')
                .map((quiz) => {
                  const bestScore = getBestScore(quiz._id);
                  
                  return (
                    <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {quiz.description}
                            </CardDescription>
                          </div>
                          <Badge className="bg-gray-500 text-white">
                            Completed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {bestScore ? (
                          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Your Score
                              </span>
                              <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                {bestScore.percentage}%
                              </span>
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {bestScore.totalScore}/{bestScore.maxScore} points • Grade: {bestScore.grade}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Not attempted</span>
                            </div>
                          </div>
                        )}

                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            fetchQuizAttempts(quiz._id);
                            // Show results modal
                          }}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {quizzes.filter(quiz => getQuizStatus(quiz).status === 'upcoming').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No upcoming quizzes</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  There are no quizzes scheduled for the future.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes
                .filter(quiz => getQuizStatus(quiz).status === 'upcoming')
                .map((quiz) => (
                  <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {quiz.description}
                          </CardDescription>
                        </div>
                        <Badge className="bg-blue-500 text-white">
                          Upcoming
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          Starts: {new Date(quiz.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          Ends: {new Date(quiz.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FileText className="h-4 w-4" />
                          {quiz.questions.length} questions
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Award className="h-4 w-4" />
                          {quiz.totalPoints} points
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <Target className="h-4 w-4" />
                          <span className="text-sm font-medium">Quiz not yet available</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          This quiz will be available on {new Date(quiz.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizSystem;
