import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Award, 
  MessageSquare, 
  CreditCard,
  TrendingUp,
  BarChart3,
  Bell,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Clock,
  MapPin,
  AlertCircle,
  FileText,
  TestTube,
  Calculator,
  BookMarked,
  PenTool,
  Download,
  Upload,
  FileCheck,
  Database,
  Code,
  Network,
  Monitor,
  BookOpenCheck,
  Calendar as CalendarIcon,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load profile image from localStorage on component mount
  useEffect(() => {
    const storedImage = localStorage.getItem('userProfileImage');
    setProfileImage(storedImage);
  }, []);

  // Listen for storage changes to update profile image when it changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedImage = localStorage.getItem('userProfileImage');
      setProfileImage(storedImage);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const timetableData = [
    { time: '9-10 AM', monday: 'DBMS', tuesday: 'Algorithms', wednesday: 'Computer Networks', thursday: 'OS', friday: 'Linear Algebra' },
    { time: '10-11 AM', monday: 'OS', tuesday: 'DBMS', wednesday: 'Linear Algebra', thursday: 'Algorithms', friday: 'DBMS' },
    { time: '11-12 PM', monday: 'Linear Algebra', tuesday: 'OS', wednesday: 'DBMS', thursday: 'DBMS', friday: 'Networks' },
    { time: '12-1 PM', monday: 'Free Slot', tuesday: 'Free Slot', wednesday: 'Algorithms', thursday: 'Free Slot', friday: 'Algorithms' },
    { time: '2-4 PM', monday: 'DBMS Lab', tuesday: 'OS Lab', wednesday: 'Seminar', thursday: 'Project Work', friday: 'Coding Practice' }
  ];

  const assignments = [
    { id: 1, title: 'Data Structures Assignment', subject: 'CSE201', dueDate: '2025-09-10', status: 'pending', priority: 'high' },
    { id: 2, title: 'Linear Algebra Problem Set', subject: 'MA103L', dueDate: '2025-09-12', status: 'submitted', priority: 'medium' },
    { id: 3, title: 'Database Management Systems Project', subject: 'CSE305', dueDate: '2025-09-14', status: 'pending', priority: 'high' }
  ];

  const internalExams = [
    { id: 1, subject: 'Mid-Semester Exam', type: 'Internal', date: '2025-09-20', endDate: '2025-09-25', time: '9:00 AM', location: 'Main Hall' },
    { id: 2, subject: 'Operating Systems', type: 'Class Test 2', date: '2025-09-18', time: '10:00 AM', location: 'Lab 1' }
  ];

  const finalExams = [
    { id: 1, subject: 'Theory Exams', type: 'Final', date: '2025-12-01', time: '9:00 AM', location: 'Various Halls' },
    { id: 2, subject: 'Lab Exams', type: 'Final', date: '2025-11-25', time: '9:00 AM', location: 'Computer Labs' }
  ];

  const results = [
    { id: 1, subject: 'Mid-Sem Results', availableFrom: '2025-10-05', status: 'available' }
  ];

  return (
    <div className="h-full w-full p-6 overflow-hidden bg-gray-50">
      {/* Welcome Banner */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
            {/* Profile Picture */}
          <Avatar className="h-16 w-16 ring-2 ring-blue-200 shadow-lg">
            {profileImage ? (
              <AvatarImage src={profileImage} alt={`${user?.firstName} ${user?.lastName}`} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
            )}
              </Avatar>
            
            {/* Welcome Text and Button */}
            <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back, {user?.firstName}!
              </h1>
            <p className="text-sm text-gray-600 mb-3">
                Today is {getCurrentDate()}
              </p>
              <Button 
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold text-sm"
                onClick={() => navigate('/profile')}
              >
                View Profile
              </Button>
            </div>
          </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
        {/* Left Column */}
        <div className="space-y-4 overflow-hidden">
      {/* Quick Stats */}
      <div>
            <h2 className="text-lg font-bold mb-3 text-gray-900">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Attendance %</p>
                  <p className="text-2xl font-bold text-blue-600">92%</p>
            </CardContent>
          </Card>
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">GPA</p>
                  <p className="text-2xl font-bold text-blue-600">3.8</p>
            </CardContent>
          </Card>
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Classes</p>
                  <p className="text-2xl font-bold text-blue-600">5</p>
            </CardContent>
          </Card>
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Assignments</p>
                  <p className="text-2xl font-bold text-blue-600">{assignments.filter(a => a.status === 'pending').length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

                {/* Timetable */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Timetable</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Google Calendar
                </Button>
              </div>
            </div>
            <Card className="bg-white shadow-sm border border-gray-200 h-full">
              <CardContent className="p-4 h-full overflow-y-auto">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Weekly Class Timetable (CSE – 3rd Year)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-semibold text-gray-700">Day</th>
                        <th className="text-left p-3 font-semibold text-gray-700">9–10 AM</th>
                        <th className="text-left p-3 font-semibold text-gray-700">10–11 AM</th>
                        <th className="text-left p-3 font-semibold text-gray-700">11–12 PM</th>
                        <th className="text-left p-3 font-semibold text-gray-700">12–1 PM</th>
                        <th className="text-left p-3 font-semibold text-gray-700">2–4 PM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 font-medium text-gray-900">Monday</td>
                        <td className="p-3 text-gray-700">{timetableData[0].monday}</td>
                        <td className="p-3 text-gray-700">{timetableData[1].monday}</td>
                        <td className="p-3 text-gray-700">{timetableData[2].monday}</td>
                        <td className="p-3 text-gray-700">{timetableData[3].monday}</td>
                        <td className="p-3 text-gray-700">{timetableData[4].monday}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 font-medium text-gray-900">Tuesday</td>
                        <td className="p-3 text-gray-700">{timetableData[0].tuesday}</td>
                        <td className="p-3 text-gray-700">{timetableData[1].tuesday}</td>
                        <td className="p-3 text-gray-700">{timetableData[2].tuesday}</td>
                        <td className="p-3 text-gray-700">{timetableData[3].tuesday}</td>
                        <td className="p-3 text-gray-700">{timetableData[4].tuesday}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 font-medium text-gray-900">Wednesday</td>
                        <td className="p-3 text-gray-700">{timetableData[0].wednesday}</td>
                        <td className="p-3 text-gray-700">{timetableData[1].wednesday}</td>
                        <td className="p-3 text-gray-700">{timetableData[2].wednesday}</td>
                        <td className="p-3 text-gray-700">{timetableData[3].wednesday}</td>
                        <td className="p-3 text-gray-700">{timetableData[4].wednesday}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 font-medium text-gray-900">Thursday</td>
                        <td className="p-3 text-gray-700">{timetableData[0].thursday}</td>
                        <td className="p-3 text-gray-700">{timetableData[1].thursday}</td>
                        <td className="p-3 text-gray-700">{timetableData[2].thursday}</td>
                        <td className="p-3 text-gray-700">{timetableData[3].thursday}</td>
                        <td className="p-3 text-gray-700">{timetableData[4].thursday}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 font-medium text-gray-900">Friday</td>
                        <td className="p-3 text-gray-700">{timetableData[0].friday}</td>
                        <td className="p-3 text-gray-700">{timetableData[1].friday}</td>
                        <td className="p-3 text-gray-700">{timetableData[2].friday}</td>
                        <td className="p-3 text-gray-700">{timetableData[3].friday}</td>
                        <td className="p-3 text-gray-700">{timetableData[4].friday}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>

        {/* Right Column */}
        <div className="space-y-4 overflow-hidden">
      {/* Analytics */}
                  <div>
            <h2 className="text-lg font-bold mb-3 text-gray-900">Analytics</h2>
            <div className="grid grid-cols-1 gap-4">
          {/* Performance Trend */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">Performance</h3>
                    <Badge className="bg-green-100 text-green-600 border-green-200 text-xs px-2 py-1">+12%</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Last 30 Days</p>
                  <div className="flex items-end space-x-2 h-16">
                    <div className="flex-1 bg-blue-200 rounded-t" style={{height: '60%'}}></div>
                    <div className="flex-1 bg-blue-200 rounded-t" style={{height: '80%'}}></div>
                    <div className="flex-1 bg-blue-200 rounded-t" style={{height: '45%'}}></div>
                    <div className="flex-1 bg-blue-200 rounded-t" style={{height: '90%'}}></div>
                    <div className="flex-1 bg-blue-200 rounded-t" style={{height: '70%'}}></div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Trend */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">Attendance</h3>
                    <Badge className="bg-red-100 text-red-600 border-red-200 text-xs px-2 py-1">-5%</Badge>
                    </div>
                  <p className="text-xs text-gray-600 mb-3">Last 30 Days</p>
                  <div className="flex items-end space-x-2 h-16">
                    <div className="flex-1 bg-gray-200 rounded-t" style={{height: '85%'}}></div>
                    <div className="flex-1 bg-gray-200 rounded-t" style={{height: '90%'}}></div>
                    <div className="flex-1 bg-gray-200 rounded-t" style={{height: '75%'}}></div>
                    <div className="flex-1 bg-gray-200 rounded-t" style={{height: '80%'}}></div>
                    <div className="flex-1 bg-gray-200 rounded-t" style={{height: '70%'}}></div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>

          {/* Assignments & Exams */}
          <div className="flex-1 overflow-hidden">
            <h2 className="text-lg font-bold mb-3 text-gray-900">Assignments & Exams</h2>
            <div className="space-y-4 h-full overflow-y-auto">
              {/* Upcoming Assignments */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Upcoming Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {assignment.status === 'submitted' ? (
                            <FileCheck className="h-4 w-4 text-green-600" />
                          ) : assignment.status === 'pending' ? (
                            <Clock className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-xs text-gray-500">{assignment.subject} – Due: {assignment.dueDate}</p>
                            <Badge 
                              variant={assignment.status === 'submitted' ? 'default' : assignment.status === 'pending' ? 'destructive' : 'secondary'}
                              className="text-xs mt-1"
                            >
                              {assignment.status === 'submitted' ? 'Submitted' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Submission Guidelines */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-xs font-semibold text-blue-800 mb-2">Submission Guidelines</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Upload in PDF/Docx format</li>
                      <li>• Late submissions penalized 10% per day</li>
                      <li>• Plagiarism &gt;20% will lead to rejection</li>
                    </ul>
                  </div>

                  {/* Downloadable Resources */}
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Downloadable Resources</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        <Download className="h-3 w-3 mr-1" />
                        Assignment Sheets
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        <Download className="h-3 w-3 mr-1" />
                        Sample Solutions
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        <Download className="h-3 w-3 mr-1" />
                        Grading Rubric
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Internal Tests */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
                    <TestTube className="h-4 w-4 mr-2" />
                    Internal Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {internalExams.map((exam) => (
                      <div key={exam.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{exam.subject}</p>
                            <p className="text-xs text-gray-500">{exam.type}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{exam.date}{exam.endDate ? ` - ${exam.endDate}` : ''}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{exam.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Final Exams */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Final Exams
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {finalExams.map((exam) => (
                      <div key={exam.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <BookOpenCheck className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{exam.subject}</p>
                            <p className="text-xs text-gray-500">{exam.type}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>Starting {exam.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{exam.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Exam Guidelines */}
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <h4 className="text-xs font-semibold text-yellow-800 mb-2">Exam Guidelines</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Carry College ID Card</li>
                      <li>• No electronic gadgets allowed</li>
                      <li>• Report 30 minutes before start time</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg"
          onClick={() => navigate('/messages')}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
