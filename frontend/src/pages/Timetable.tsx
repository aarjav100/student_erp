import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  BookOpen, Clock, Users, Calendar, MapPin, FileText, Download, 
  ChevronDown, Book, Calculator, Atom, FlaskConical, Laptop, 
  GraduationCap, Zap, Heart, ThumbsUp, Bell, CheckCircle, AlertCircle,
  Moon, Sun, Menu
} from 'lucide-react';
import { useState, useMemo } from 'react';

const Timetable = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDay, setSelectedDay] = useState('monday');

  // Sample timetable data with color-coded subjects
  const timetableData = {
    monday: [
      {
        id: 1,
        subject: 'Mathematics',
        course: 'Calculus I',
        time: '9:00 AM - 10:00 AM',
        room: 'Room 201',
        instructor: 'Dr. Smith',
        color: 'bg-blue-600',
        textColor: 'text-white',
        description: 'Differential Calculus'
      },
      {
        id: 2,
        subject: 'Physics',
        course: 'Physics I',
        time: '10:30 AM - 11:30 AM',
        room: 'Room 105',
        instructor: 'Dr. Johnson',
        color: 'bg-orange-500',
        textColor: 'text-white',
        description: 'Mechanics and Thermodynamics'
      },
      {
        id: 3,
        subject: 'Chemistry',
        course: 'Organic Chemistry',
        time: '2:00 PM - 3:00 PM',
        room: 'Room 301',
        instructor: 'Dr. Williams',
        color: 'bg-green-500',
        textColor: 'text-white',
        description: 'Organic Chemistry Lecture'
      }
    ],
    tuesday: [
      {
        id: 4,
        subject: 'Computer Science',
        course: 'Data Structures',
        time: '9:00 AM - 10:00 AM',
        room: 'Room 205',
        instructor: 'Dr. Brown',
        color: 'bg-gray-600',
        textColor: 'text-white',
        description: 'Advanced Data Structures'
      },
      {
        id: 5,
        subject: 'Literature',
        course: 'World Literature',
        time: '11:00 AM - 12:00 PM',
        room: 'Room 401',
        instructor: 'Prof. Davis',
        color: 'bg-purple-400',
        textColor: 'text-white',
        description: 'Classical Literature Studies'
      },
      {
        id: 6,
        subject: 'Physics',
        course: 'Optics Lab',
        time: '2:00 PM - 4:00 PM',
        room: 'Lab 102',
        instructor: 'Dr. Johnson',
        color: 'bg-orange-200',
        textColor: 'text-orange-800',
        description: 'Optics Laboratory Session'
      }
    ],
    wednesday: [
      {
        id: 7,
        subject: 'Mathematics',
        course: 'Linear Algebra',
        time: '10:00 AM - 11:00 AM',
        room: 'Room 201',
        instructor: 'Dr. Smith',
        color: 'bg-blue-600',
        textColor: 'text-white',
        description: 'Vector Spaces and Matrices'
      },
      {
        id: 8,
        subject: 'Chemistry',
        course: 'Chemistry Lab',
        time: '1:00 PM - 3:00 PM',
        room: 'Lab 201',
        instructor: 'Dr. Williams',
        color: 'bg-green-200',
        textColor: 'text-green-800',
        description: 'Organic Chemistry Laboratory'
      }
    ],
    thursday: [
      {
        id: 9,
        subject: 'Computer Science',
        course: 'Algorithms',
        time: '9:00 AM - 10:00 AM',
        room: 'Room 205',
        instructor: 'Dr. Brown',
        color: 'bg-gray-600',
        textColor: 'text-white',
        description: 'Algorithm Design and Analysis'
      },
      {
        id: 10,
        subject: 'Literature',
        course: 'Literature',
        time: '11:00 AM - 12:00 PM',
        room: 'Room 401',
        instructor: 'Prof. Davis',
        color: 'bg-purple-400',
        textColor: 'text-white',
        description: 'Modern Literature Analysis'
      }
    ],
    friday: [
      {
        id: 11,
        subject: 'Mathematics',
        course: 'Calculus I',
        time: '9:00 AM - 10:00 AM',
        room: 'Room 201',
        instructor: 'Dr. Smith',
        color: 'bg-blue-600',
        textColor: 'text-white',
        description: 'Integration Techniques'
      },
      {
        id: 12,
        subject: 'Physics',
        course: 'Physics I',
        time: '10:30 AM - 11:30 AM',
        room: 'Room 105',
        instructor: 'Dr. Johnson',
        color: 'bg-orange-500',
        textColor: 'text-white',
        description: 'Wave Motion and Sound'
      }
    ]
  };

  // Sample assignments data
  const assignments = [
    {
      id: 1,
      title: 'Homework 3',
      subject: 'Mathematics',
      dueDate: '2024-12-20',
      color: 'bg-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      icon: Calculator,
      description: 'Calculus Integration Problems'
    },
    {
      id: 2,
      title: 'Lab Report Due',
      subject: 'Physics',
      dueDate: '2024-12-18',
      color: 'bg-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      icon: Atom,
      description: 'Optics Laboratory Report'
    },
    {
      id: 3,
      title: 'Lab Report Due',
      subject: 'Chemistry',
      dueDate: '2024-12-22',
      color: 'bg-pink-200',
      textColor: 'text-pink-800',
      iconColor: 'text-pink-600',
      icon: FlaskConical,
      description: 'Organic Chemistry Lab Report'
    }
  ];

  // Subject tabs configuration
  const subjectTabs = [
    { id: 'all', label: 'All Subjects', color: isDark ? 'bg-gray-700' : 'bg-gray-100', textColor: isDark ? 'text-gray-300' : 'text-gray-700' },
    { id: 'mathematics', label: 'Mathematics', color: 'bg-blue-600', textColor: 'text-white' },
    { id: 'physics', label: 'Physics', color: 'bg-orange-500', textColor: 'text-white' },
    { id: 'chemistry', label: 'Chemistry', color: 'bg-green-500', textColor: 'text-white' },
    { id: 'computer-science', label: 'Computer Science', color: 'bg-gray-600', textColor: 'text-white' },
    { id: 'literature', label: 'Literature', color: 'bg-purple-500', textColor: 'text-white' }
  ];

  // Days configuration
  const days = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' }
  ];

  // Filter classes based on selected subject
  const filteredClasses = useMemo(() => {
    const dayClasses = timetableData[selectedDay] || [];
    if (selectedSubject === 'all') {
      return dayClasses;
    }
    return dayClasses.filter(cls => 
      cls.subject.toLowerCase().replace(' ', '-') === selectedSubject
    );
  }, [selectedSubject, selectedDay]);

  // Get subject icon
  const getSubjectIcon = (subject) => {
    switch (subject.toLowerCase()) {
      case 'mathematics': return Calculator;
      case 'physics': return Atom;
      case 'chemistry': return FlaskConical;
      case 'computer science': return Laptop;
      case 'literature': return Book;
      default: return BookOpen;
    }
  };

  // Helpers to darken background colors in dark mode
  const darkenBg = (bg: string) => {
    // convert tailwind like 'bg-blue-600' -> darker shade
    const m = bg.match(/^(bg-[a-z-]+)-(\d{3})$/);
    if (!m) return bg;
    const base = m[1];
    const shade = parseInt(m[2], 10);
    const darker = Math.min(900, shade + 200);
    return `${base}-${darker}`;
  };

  // Class card component
  const ClassCard = ({ classItem }) => {
    const SubjectIcon = getSubjectIcon(classItem.subject);
    const bgColor = isDark ? darkenBg(classItem.color) : classItem.color;
    const textColor = isDark ? 'text-white' : classItem.textColor;
    
    return (
      <Card className={`${bgColor} ${textColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <SubjectIcon className="h-5 w-5" />
              <span className="font-semibold text-sm">{classItem.subject}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-lg leading-tight">{classItem.course}</h3>
            <p className="text-sm opacity-90">{classItem.description}</p>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{classItem.time}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{classItem.room}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>{classItem.instructor}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Assignment card component
  const AssignmentCard = ({ assignment }) => {
    const Icon = assignment.icon;
    const bgColor = isDark ? darkenBg(assignment.color.replace('bg-', 'bg-')) : assignment.color;
    const textColor = isDark ? 'text-white' : assignment.textColor;

  return (
      <Card className={`${bgColor} ${textColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${assignment.iconColor}`} />
              <span className="font-semibold text-sm">{assignment.subject}</span>
          </div>
            <ChevronDown className="h-4 w-4 opacity-70" />
                      </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-lg leading-tight">{assignment.title}</h3>
            <p className="text-sm opacity-90">{assignment.description}</p>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className={`${isDark ? 'btn-secondary' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center">
            <div className={`p-4 ${isDark ? 'gradient-primary' : 'bg-gradient-to-r from-blue-500 to-purple-600'} rounded-full shadow-lg`}>
              <Calendar className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}`}>
            Class Timetable
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Welcome back, <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{user?.firstName}</span>! Here's your weekly schedule
          </p>
        </div>

        {/* Subject Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {subjectTabs.map((tab) => (
              <Button 
                key={tab.id}
                variant={selectedSubject === tab.id ? "default" : "outline"}
                className={`${tab.color} ${tab.textColor} border-0 rounded-full px-6 py-3 font-medium transition-all duration-200 hover:scale-105 ${
                  selectedSubject === tab.id 
                    ? 'shadow-lg ring-2 ring-purple-400 ring-opacity-50' 
                    : isDark 
                      ? 'hover:shadow-md btn-secondary'
                      : 'hover:shadow-md bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSubject(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Day Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {days.map((day) => (
              <Button
                key={day.id}
                variant={selectedDay === day.id ? "default" : "outline"}
                className={`rounded-full px-6 py-2 font-medium transition-all duration-200 ${
                  selectedDay === day.id
                    ? 'btn-primary'
                    : isDark
                      ? 'btn-secondary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDay(day.id)}
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Classes Section */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {days.find(d => d.id === selectedDay)?.label} Classes
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'} scheduled
              </p>
            </div>

            {filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClasses.map((classItem) => (
                  <ClassCard key={classItem.id} classItem={classItem} />
                ))}
                                    </div>
            ) : (
              <Card className={`border-0 shadow-lg ${isDark ? 'card-dark' : 'bg-white'}`}>
                <CardContent className="p-12 text-center">
                  <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>No Classes Today</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {selectedSubject === 'all' 
                      ? "You don't have any classes scheduled for this day."
                      : `No ${subjectTabs.find(t => t.id === selectedSubject)?.label} classes scheduled for this day.`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Assignments Sidebar */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Assignments</h2>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {assignments.length} upcoming assignments
              </p>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>

            {/* Quick Stats */}
            <Card className={`mt-8 border-0 shadow-lg ${isDark ? 'card-dark' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
              <CardContent className="p-6">
                <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Classes</span>
                    <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {Object.values(timetableData).flat().length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>This Week</span>
                    <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {Object.values(timetableData).flat().length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Assignments Due</span>
                    <span className={`font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      {assignments.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </div>
    </div>
  );
};

export default Timetable;
