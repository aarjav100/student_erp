import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  Download,
  ExternalLink,
  Clock,
  MapPin,
  BookOpen,
  Code,
  Database,
  Calculator,
  Network,
  Monitor,
  Users,
  Settings,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { useState } from 'react';

// Edit Cell Form Component
const EditCellForm = ({ day, time, classInfo, onSave, onCancel, subjects }: any) => {
  const [formData, setFormData] = useState(() => {
    // Initialize form data based on current class info
    if (classInfo.subject === 'Free Slot') {
      return {
        subject: 'Free Slot',
        code: '',
        room: '',
        type: 'Free'
      };
    }
    return {
      subject: classInfo.subject || '',
      code: classInfo.code || '',
      room: classInfo.room || '',
      type: classInfo.type || 'Theory'
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form data
    if (formData.subject === 'Free Slot') {
      onSave(day, time, {
        subject: 'Free Slot',
        code: '',
        room: '',
        type: 'Free'
      });
    } else if (formData.subject && formData.code) {
      onSave(day, time, formData);
    }
  };

  const handleSubjectChange = (value: string) => {
    if (value === 'Free Slot') {
      setFormData({
        subject: 'Free Slot',
        code: '',
        room: '',
        type: 'Free'
      });
    } else {
      // Find the selected subject from the subjects array
      const selectedSubject = subjects.find((sub: any) => sub.name === value);
      setFormData(prev => ({
        subject: value,
        code: selectedSubject?.code || prev.code,
        room: prev.room,
        type: prev.type === 'Free' ? 'Theory' : prev.type
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <Select value={formData.subject} onValueChange={handleSubjectChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="Free Slot">Free Slot</SelectItem>
            {subjects.map((subject: any) => (
              <SelectItem key={subject.code} value={subject.name}>
                {subject.name} ({subject.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {formData.subject !== 'Free Slot' && (
        <>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            placeholder="Subject code"
            className="h-8 text-xs"
          />
          <Input
            value={formData.room}
            onChange={(e) => setFormData({...formData, room: e.target.value})}
            placeholder="Room number"
            className="h-8 text-xs"
          />
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Theory">Theory</SelectItem>
              <SelectItem value="Lab">Lab</SelectItem>
              <SelectItem value="Seminar">Seminar</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
              <SelectItem value="Practice">Practice</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}
      
      <div className="flex space-x-1">
        <Button type="submit" size="sm" className="h-6 px-2 text-xs">
          <Check className="h-3 w-3" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-6 px-2 text-xs">
          <X className="h-3 w-3" />
        </Button>
      </div>
    </form>
  );
};

const Timetable = () => {
  const timetableData = [
    { 
      time: '9-10 AM', 
      monday: { subject: 'DBMS', code: 'CSE305', room: 'Room 201', type: 'Theory' },
      tuesday: { subject: 'Algorithms', code: 'CSE201', room: 'Room 202', type: 'Theory' },
      wednesday: { subject: 'Computer Networks', code: 'CSE302', room: 'Room 203', type: 'Theory' },
      thursday: { subject: 'OS', code: 'CSE301', room: 'Room 201', type: 'Theory' },
      friday: { subject: 'Linear Algebra', code: 'MA103L', room: 'Room 204', type: 'Theory' }
    },
    { 
      time: '10-11 AM', 
      monday: { subject: 'OS', code: 'CSE301', room: 'Room 202', type: 'Theory' },
      tuesday: { subject: 'DBMS', code: 'CSE305', room: 'Room 201', type: 'Theory' },
      wednesday: { subject: 'Linear Algebra', code: 'MA103L', room: 'Room 204', type: 'Theory' },
      thursday: { subject: 'Algorithms', code: 'CSE201', room: 'Room 202', type: 'Theory' },
      friday: { subject: 'DBMS', code: 'CSE305', room: 'Room 201', type: 'Theory' }
    },
    { 
      time: '11-12 PM', 
      monday: { subject: 'Linear Algebra', code: 'MA103L', room: 'Room 204', type: 'Theory' },
      tuesday: { subject: 'OS', code: 'CSE301', room: 'Room 202', type: 'Theory' },
      wednesday: { subject: 'DBMS', code: 'CSE305', room: 'Room 201', type: 'Theory' },
      thursday: { subject: 'DBMS', code: 'CSE305', room: 'Room 201', type: 'Theory' },
      friday: { subject: 'Networks', code: 'CSE302', room: 'Room 203', type: 'Theory' }
    },
    { 
      time: '12-1 PM', 
      monday: { subject: 'Free Slot', code: '', room: '', type: 'Free' },
      tuesday: { subject: 'Free Slot', code: '', room: '', type: 'Free' },
      wednesday: { subject: 'Algorithms', code: 'CSE201', room: 'Room 202', type: 'Theory' },
      thursday: { subject: 'Free Slot', code: '', room: '', type: 'Free' },
      friday: { subject: 'Algorithms', code: 'CSE201', room: 'Room 202', type: 'Theory' }
    },
    { 
      time: '2-4 PM', 
      monday: { subject: 'DBMS Lab', code: 'CSE305L', room: 'Lab 1', type: 'Lab' },
      tuesday: { subject: 'OS Lab', code: 'CSE301L', room: 'Lab 2', type: 'Lab' },
      wednesday: { subject: 'Seminar', code: 'CSE399', room: 'Auditorium', type: 'Seminar' },
      thursday: { subject: 'Project Work', code: 'CSE498', room: 'Lab 3', type: 'Project' },
      friday: { subject: 'Coding Practice', code: 'CSE299', room: 'Lab 1', type: 'Practice' }
    }
  ];

  const [currentWeek, setCurrentWeek] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState<{day: string, time: string} | null>(null);
  const [customTimetable, setCustomTimetable] = useState(timetableData);
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', color: 'bg-gray-100 text-gray-800' });

  const subjects = [
    { code: 'CSE201', name: 'Data Structures & Algorithms', color: 'bg-blue-100 text-blue-800' },
    { code: 'CSE301', name: 'Operating Systems', color: 'bg-green-100 text-green-800' },
    { code: 'CSE302', name: 'Computer Networks', color: 'bg-purple-100 text-purple-800' },
    { code: 'CSE305', name: 'Database Management Systems', color: 'bg-orange-100 text-orange-800' },
    { code: 'MA103L', name: 'Linear Algebra', color: 'bg-pink-100 text-pink-800' },
    { code: 'CSE305L', name: 'DBMS Lab', color: 'bg-orange-100 text-orange-800' },
    { code: 'CSE301L', name: 'OS Lab', color: 'bg-green-100 text-green-800' },
    { code: 'CSE399', name: 'Seminar', color: 'bg-indigo-100 text-indigo-800' },
    { code: 'CSE498', name: 'Project Work', color: 'bg-red-100 text-red-800' },
    { code: 'CSE299', name: 'Coding Practice', color: 'bg-cyan-100 text-cyan-800' }
  ];

  const getSubjectIcon = (code: string) => {
    switch (code) {
      case 'CSE201': return <Code className="h-4 w-4" />;
      case 'CSE301': return <Monitor className="h-4 w-4" />;
      case 'CSE302': return <Network className="h-4 w-4" />;
      case 'CSE305': return <Database className="h-4 w-4" />;
      case 'MA103L': return <Calculator className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Theory': return 'bg-blue-100 text-blue-800';
      case 'Lab': return 'bg-green-100 text-green-800';
      case 'Seminar': return 'bg-purple-100 text-purple-800';
      case 'Project': return 'bg-red-100 text-red-800';
      case 'Practice': return 'bg-cyan-100 text-cyan-800';
      case 'Free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleEditCell = (day: string, time: string) => {
    setEditingCell({ day, time });
  };

  const handleSaveCell = (day: string, time: string, newData: any) => {
    const updatedTimetable = customTimetable.map(row => {
      if (row.time === time) {
        return {
          ...row,
          [day.toLowerCase()]: newData
        };
      }
      return row;
    });
    setCustomTimetable(updatedTimetable);
    setEditingCell(null);
  };

  const handleClearCell = (day: string, time: string) => {
    const updatedTimetable = customTimetable.map(row => {
      if (row.time === time) {
        return {
          ...row,
          [day.toLowerCase()]: { subject: 'Free Slot', code: '', room: '', type: 'Free' }
        };
      }
      return row;
    });
    setCustomTimetable(updatedTimetable);
  };

  const handleAddSubject = () => {
    if (newSubject.name && newSubject.code) {
      // Add to subjects list (in a real app, this would be saved to backend)
      const newSubjectData = {
        code: newSubject.code,
        name: newSubject.name,
        color: newSubject.color
      };
      // Update subjects array (in a real app, this would be saved to backend)
      setShowAddSubjectDialog(false);
      setNewSubject({ name: '', code: '', color: 'bg-gray-100 text-gray-800' });
    }
  };

  const handleResetTimetable = () => {
    setCustomTimetable(timetableData);
    setIsEditMode(false);
  };

  const handleSaveTimetable = () => {
    // In a real app, this would save to backend
    localStorage.setItem('customTimetable', JSON.stringify(customTimetable));
    setIsEditMode(false);
  };

  return (
    <div className="h-full w-full p-6 overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Timetable</h1>
            <p className="text-gray-600">Weekly Class Timetable (CSE – 3rd Year)</p>
          </div>
          <div className="flex space-x-2">
            {!isEditMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit Timetable
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Google Calendar
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="sm"
                  onClick={handleSaveTimetable}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResetTimetable}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Dialog open={showAddSubjectDialog} onOpenChange={setShowAddSubjectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Subject</DialogTitle>
                      <DialogDescription>
                        Add a new subject to your timetable
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Subject Name</label>
                        <Input
                          value={newSubject.name}
                          onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                          placeholder="e.g., Machine Learning"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Subject Code</label>
                        <Input
                          value={newSubject.code}
                          onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                          placeholder="e.g., CSE401"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddSubjectDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddSubject}>
                          Add Subject
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Edit3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Edit Mode Active</span>
            <span className="text-xs text-blue-600">Click on any cell to edit, or use the buttons below each cell</span>
          </div>
        </div>
      )}

      {/* Week Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
            >
              Previous Week
            </Button>
            <span className="text-sm font-medium text-gray-700">
              Week {currentWeek + 1}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentWeek(currentWeek + 1)}
            >
              Next Week
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            Current Date: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-700 min-w-[120px]">Time</th>
                  {days.map((day) => (
                    <th key={day} className="text-left p-4 font-semibold text-gray-700 min-w-[200px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customTimetable.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50">
                      {row.time}
                    </td>
                    {days.map((day) => {
                      const dayKey = day.toLowerCase() as keyof typeof row;
                      const classInfo = row[dayKey] as any;
                      const isEditing = editingCell?.day === day && editingCell?.time === row.time;
                      
                      return (
                        <td key={day} className="p-4 relative group">
                          {isEditing ? (
                            <EditCellForm
                              day={day}
                              time={row.time}
                              classInfo={classInfo}
                              onSave={handleSaveCell}
                              onCancel={() => setEditingCell(null)}
                              subjects={subjects}
                            />
                          ) : (
                            <div className="space-y-2">
                              {classInfo.subject === 'Free Slot' ? (
                                <div className="text-center text-gray-400 py-4">
                                  <Clock className="h-6 w-6 mx-auto mb-2" />
                                  <span className="text-sm">Free Slot</span>
                                  {isEditMode && (
                                    <div className="mt-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditCell(day, row.time)}
                                        className="text-xs"
                                      >
                                        <Edit3 className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-2">
                                    {getSubjectIcon(classInfo.code)}
                                    <div>
                                      <p className="font-medium text-gray-900 text-sm">{classInfo.subject}</p>
                                      <p className="text-xs text-gray-500">{classInfo.code}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    <span>{classInfo.room}</span>
                                  </div>
                                  <Badge className={`text-xs ${getTypeColor(classInfo.type)}`}>
                                    {classInfo.type}
                                  </Badge>
                                  {isEditMode && (
                                    <div className="flex space-x-1 mt-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditCell(day, row.time)}
                                        className="text-xs h-6 px-2"
                                      >
                                        <Edit3 className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleClearCell(day, row.time)}
                                        className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Subject Legend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Subject Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <div key={subject.code} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                {getSubjectIcon(subject.code)}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{subject.code}</p>
                  <p className="text-xs text-gray-600">{subject.name}</p>
                </div>
                <Badge className={`ml-auto text-xs ${subject.color}`}>
                  {subject.code}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Types */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Class Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">Theory</Badge>
              <span className="text-sm text-gray-600">Regular classes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">Lab</Badge>
              <span className="text-sm text-gray-600">Practical sessions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-800">Seminar</Badge>
              <span className="text-sm text-gray-600">Presentations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-100 text-red-800">Project</Badge>
              <span className="text-sm text-gray-600">Project work</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-cyan-100 text-cyan-800">Practice</Badge>
              <span className="text-sm text-gray-600">Coding practice</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Important Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Timing</p>
                <p className="text-sm text-gray-600">Classes start exactly at the scheduled time. Late entry may not be permitted.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Room Changes</p>
                <p className="text-sm text-gray-600">Room changes will be notified in advance. Check notice board regularly.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Attendance</p>
                <p className="text-sm text-gray-600">Attendance is mandatory for all classes. Minimum 75% required.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Updates</p>
                <p className="text-sm text-gray-600">Timetable updates will be communicated via email and notice board.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timetable;
