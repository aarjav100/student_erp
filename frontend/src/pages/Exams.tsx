import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  TestTube, 
  Clock, 
  MapPin, 
  Calendar,
  AlertCircle,
  BookOpenCheck,
  GraduationCap,
  Search,
  Filter,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useState } from 'react';

const Exams = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const internalExams = [
    {
      id: 1,
      subject: 'Mid-Semester Exam',
      type: 'Internal',
      date: '2025-09-20',
      endDate: '2025-09-25',
      time: '9:00 AM - 12:00 PM',
      location: 'Main Hall',
      duration: '3 hours',
      status: 'upcoming',
      subjects: ['Data Structures', 'Linear Algebra', 'DBMS', 'OS'],
      instructions: 'Carry College ID Card, No electronic gadgets allowed'
    },
    {
      id: 2,
      subject: 'Operating Systems',
      type: 'Class Test 2',
      date: '2025-09-18',
      time: '10:00 AM - 11:30 AM',
      location: 'Lab 1',
      duration: '1.5 hours',
      status: 'upcoming',
      subjects: ['Process Scheduling', 'Memory Management'],
      instructions: 'Practical exam with coding questions'
    },
    {
      id: 3,
      subject: 'Data Structures',
      type: 'Quiz',
      date: '2025-09-15',
      time: '2:00 PM - 3:00 PM',
      location: 'Room 201',
      duration: '1 hour',
      status: 'completed',
      subjects: ['Binary Trees', 'Graphs'],
      instructions: 'Multiple choice and short answer questions',
      score: '85/100'
    }
  ];

  const finalExams = [
    {
      id: 1,
      subject: 'Theory Exams',
      type: 'Final',
      date: '2025-12-01',
      endDate: '2025-12-15',
      time: '9:00 AM - 12:00 PM',
      location: 'Various Halls',
      duration: '3 hours',
      status: 'upcoming',
      subjects: ['All Core Subjects'],
      instructions: 'Comprehensive examination covering all semesters'
    },
    {
      id: 2,
      subject: 'Lab Exams',
      type: 'Final',
      date: '2025-11-25',
      endDate: '2025-11-30',
      time: '9:00 AM - 1:00 PM',
      location: 'Computer Labs',
      duration: '4 hours',
      status: 'upcoming',
      subjects: ['Programming', 'Database Design', 'System Design'],
      instructions: 'Practical implementation and coding'
    }
  ];

  const results = [
    {
      id: 1,
      subject: 'Mid-Sem Results',
      availableFrom: '2025-10-05',
      status: 'available',
      totalMarks: 100,
      obtainedMarks: 78,
      grade: 'B+'
    },
    {
      id: 2,
      subject: 'Class Test 1 Results',
      availableFrom: '2025-09-10',
      status: 'available',
      totalMarks: 50,
      obtainedMarks: 42,
      grade: 'A-'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Internal': return 'bg-orange-100 text-orange-800';
      case 'Final': return 'bg-red-100 text-red-800';
      case 'Quiz': return 'bg-yellow-100 text-yellow-800';
      case 'Class Test': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const allExams = [...internalExams, ...finalExams];
  const filteredExams = allExams.filter(exam => {
    const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || exam.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full w-full p-6 overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exams & Tests</h1>
        <p className="text-gray-600">Track your examination schedule and results</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterType === 'Internal' ? 'default' : 'outline'}
            onClick={() => setFilterType('Internal')}
            size="sm"
          >
            Internal
          </Button>
          <Button
            variant={filterType === 'Final' ? 'default' : 'outline'}
            onClick={() => setFilterType('Final')}
            size="sm"
          >
            Final
          </Button>
          <Button
            variant={filterType === 'Quiz' ? 'default' : 'outline'}
            onClick={() => setFilterType('Quiz')}
            size="sm"
          >
            Quiz
          </Button>
        </div>
      </div>

      {/* Exam Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Exams</p>
                <p className="text-2xl font-bold text-blue-600">{allExams.filter(e => e.status === 'upcoming').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{allExams.filter(e => e.status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Results Available</p>
                <p className="text-2xl font-bold text-purple-600">{results.length}</p>
              </div>
              <BookOpenCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{allExams.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Internal Tests */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TestTube className="h-5 w-5 mr-2" />
          Internal Tests
        </h2>
        <div className="space-y-4">
          {internalExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{exam.subject}</h3>
                      <Badge className={getTypeColor(exam.type)}>
                        {exam.type}
                      </Badge>
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{exam.date}{exam.endDate ? ` - ${exam.endDate}` : ''}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{exam.time} ({exam.duration})</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{exam.location}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <p className="font-medium text-gray-700 mb-1">Subjects Covered:</p>
                          <p className="text-gray-600">{exam.subjects.join(', ')}</p>
                        </div>
                        {exam.score && (
                          <div className="text-sm">
                            <p className="font-medium text-gray-700">Score: <span className="text-green-600">{exam.score}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800">{exam.instructions}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Hall Ticket
                    </Button>
                    {exam.status === 'upcoming' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Final Exams */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <GraduationCap className="h-5 w-5 mr-2" />
          Final Exams
        </h2>
        <div className="space-y-4">
          {finalExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{exam.subject}</h3>
                      <Badge className={getTypeColor(exam.type)}>
                        {exam.type}
                      </Badge>
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Starting {exam.date}{exam.endDate ? ` - ${exam.endDate}` : ''}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{exam.time} ({exam.duration})</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{exam.location}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <p className="font-medium text-gray-700 mb-1">Subjects Covered:</p>
                          <p className="text-gray-600">{exam.subjects.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <p className="text-sm text-red-800">{exam.instructions}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BookOpenCheck className="h-5 w-5 mr-2" />
          Results
        </h2>
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{result.subject}</h3>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-700">Available From:</p>
                        <p>{result.availableFrom}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-700">Score:</p>
                        <p>{result.obtainedMarks}/{result.totalMarks}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-700">Grade:</p>
                        <p className="text-lg font-bold text-green-600">{result.grade}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-1" />
                      Download Result
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Exam Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exam Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">ID Card</h4>
              <p className="text-sm text-blue-700">Carry College ID Card for all exams</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Electronic Devices</h4>
              <p className="text-sm text-yellow-700">No electronic gadgets allowed (except approved calculators)</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Reporting Time</h4>
              <p className="text-sm text-green-700">Report at least 30 minutes before start time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Exams;
