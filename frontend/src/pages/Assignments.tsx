import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Circle, 
  Download, 
  Upload, 
  Search, 
  Filter,
  Calendar,
  AlertCircle,
  BookOpen,
  Code,
  Database,
  Calculator
} from 'lucide-react';
import { useState } from 'react';

const Assignments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const assignments = [
    { 
      id: 1, 
      title: 'Data Structures Assignment', 
      subject: 'CSE201', 
      dueDate: '2025-09-10', 
      status: 'pending', 
      priority: 'high',
      description: 'Implement Binary Search Tree operations',
      points: 100,
      submittedBy: 0,
      totalStudents: 45
    },
    { 
      id: 2, 
      title: 'Linear Algebra Problem Set', 
      subject: 'MA103L', 
      dueDate: '2025-09-12', 
      status: 'submitted', 
      priority: 'medium',
      description: 'Solve matrix operations and vector spaces',
      points: 80,
      submittedBy: 45,
      totalStudents: 45
    },
    { 
      id: 3, 
      title: 'Database Management Systems Project', 
      subject: 'CSE305', 
      dueDate: '2025-09-14', 
      status: 'pending', 
      priority: 'high',
      description: 'Design and implement a complete database system',
      points: 150,
      submittedBy: 12,
      totalStudents: 45
    },
    { 
      id: 4, 
      title: 'Operating Systems Lab Report', 
      subject: 'CSE301', 
      dueDate: '2025-09-16', 
      status: 'pending', 
      priority: 'medium',
      description: 'Process scheduling algorithms implementation',
      points: 90,
      submittedBy: 8,
      totalStudents: 45
    },
    { 
      id: 5, 
      title: 'Computer Networks Assignment', 
      subject: 'CSE302', 
      dueDate: '2025-09-18', 
      status: 'graded', 
      priority: 'low',
      description: 'Network protocols and routing algorithms',
      points: 70,
      submittedBy: 45,
      totalStudents: 45,
      grade: 'A-'
    }
  ];

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'CSE201': return <Code className="h-4 w-4" />;
      case 'MA103L': return <Calculator className="h-4 w-4" />;
      case 'CSE305': return <Database className="h-4 w-4" />;
      case 'CSE301': return <BookOpen className="h-4 w-4" />;
      case 'CSE302': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full w-full p-6 overflow-y-auto overflow-x-hidden bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
        <p className="text-gray-600">Manage and track your academic assignments</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('pending')}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === 'submitted' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('submitted')}
            size="sm"
          >
            Submitted
          </Button>
          <Button
            variant={filterStatus === 'graded' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('graded')}
            size="sm"
          >
            Graded
          </Button>
        </div>
      </div>

      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{assignments.filter(a => a.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-green-600">{assignments.filter(a => a.status === 'submitted').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Graded</p>
                <p className="text-2xl font-bold text-blue-600">{assignments.filter(a => a.status === 'graded').length}</p>
              </div>
              <Circle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getSubjectIcon(assignment.subject)}
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </Badge>
                    <Badge className={getPriorityColor(assignment.priority)}>
                      {assignment.priority} Priority
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {assignment.dueDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{assignment.points} points</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{assignment.submittedBy}/{assignment.totalStudents} submitted</span>
                    </div>
                    {assignment.grade && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Grade: {assignment.grade}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {assignment.status === 'pending' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-4 w-4 mr-1" />
                      Submit
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submission Guidelines */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Submission Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">File Format</h4>
              <p className="text-sm text-blue-700">Upload in PDF/Docx format only</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Late Submissions</h4>
              <p className="text-sm text-yellow-700">Penalized 10% per day</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Plagiarism</h4>
              <p className="text-sm text-red-700">>20% will lead to rejection</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assignments;
