import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Users, BookOpen, GraduationCap } from 'lucide-react';

interface Course {
  _id: string;
  courseCode: string;
  title: string;
  description: string;
  department: string;
  degree: string;
  duration: number;
  totalCredits: number;
  maxStudents: number;
  currentEnrollment: number;
  status: string;
  hod?: {
    _id: string;
    name: string;
    email: string;
  };
  coordinator?: {
    _id: string;
    name: string;
    email: string;
  };
  feeStructure: {
    tuitionFee: number;
    otherFees: number;
    totalFee: number;
  };
  createdAt: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  semester: number;
  year: number;
  instructor?: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  isElective: boolean;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [faculty, setFaculty] = useState<any[]>([]);
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCourses();
    fetchFaculty();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses || []);
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users?role=faculty`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFaculty(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchSubjects = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subjects/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleCreateCourse = async (courseData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Course created successfully",
        });
        fetchCourses();
        setIsCreateDialogOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCourse = async (courseId: string, courseData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
        fetchCourses();
        setIsEditDialogOpen(false);
        setEditingCourse(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update course');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Course deleted successfully",
        });
        fetchCourses();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete course');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubject = async (subjectData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject created successfully",
        });
        if (selectedCourse) {
          fetchSubjects(selectedCourse._id);
        }
        setIsSubjectDialogOpen(false);
        setEditingSubject(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subject');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubject = async (subjectId: string, subjectData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
        if (selectedCourse) {
          fetchSubjects(selectedCourse._id);
        }
        setIsSubjectDialogOpen(false);
        setEditingSubject(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subject');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject deleted successfully",
        });
        if (selectedCourse) {
          fetchSubjects(selectedCourse._id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subject');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Manage courses and subjects</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new course to the system
              </DialogDescription>
            </DialogHeader>
            <CourseForm
              onSubmit={handleCreateCourse}
              faculty={faculty}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.courseCode}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      {course.degree} - {course.department}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {course.totalCredits} Credits
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {course.currentEnrollment}/{course.maxStudents} Students
                    </div>
                    <div className="text-sm font-medium">
                      ₹{course.feeStructure.totalFee.toLocaleString()}/year
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        fetchSubjects(course._id);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCourse(course);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCourse(course._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          {selectedCourse ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Subjects for {selectedCourse.title}
                </h3>
                <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSubject ? 'Edit Subject' : 'Create New Subject'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSubject ? 'Update subject details' : 'Add a new subject to this course'}
                      </DialogDescription>
                    </DialogHeader>
                    <SubjectForm
                      courseId={selectedCourse._id}
                      onSubmit={editingSubject ? 
                        (data) => handleUpdateSubject(editingSubject._id, data) :
                        handleCreateSubject
                      }
                      faculty={faculty}
                      initialData={editingSubject}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject._id}>
                      <TableCell className="font-medium">{subject.code}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>Sem {subject.semester}, Year {subject.year}</TableCell>
                      <TableCell>{subject.instructor?.name || 'Not assigned'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subject.status)}>
                          {subject.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingSubject(subject);
                              setIsSubjectDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubject(subject._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Select a course to view its subjects</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course details
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <CourseForm
              onSubmit={(data) => handleUpdateCourse(editingCourse._id, data)}
              faculty={faculty}
              initialData={editingCourse}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Course Form Component
const CourseForm: React.FC<{
  onSubmit: (data: any) => void;
  faculty: any[];
  initialData?: Course | null;
}> = ({ onSubmit, faculty, initialData }) => {
  const [formData, setFormData] = useState({
    courseCode: initialData?.courseCode || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    department: initialData?.department || '',
    degree: initialData?.degree || '',
    duration: initialData?.duration || 4,
    totalCredits: initialData?.totalCredits || 160,
    maxStudents: initialData?.maxStudents || 60,
    hod: initialData?.hod?._id || '',
    coordinator: initialData?.coordinator?._id || '',
    eligibility: initialData?.eligibility || '',
    admissionProcess: initialData?.admissionProcess || '',
    tuitionFee: initialData?.feeStructure?.tuitionFee || 0,
    otherFees: initialData?.feeStructure?.otherFees || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseData = {
      ...formData,
      feeStructure: {
        tuitionFee: formData.tuitionFee,
        otherFees: formData.otherFees,
        totalFee: formData.tuitionFee + formData.otherFees,
      },
    };
    onSubmit(courseData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="courseCode">Course Code</Label>
          <Input
            id="courseCode"
            value={formData.courseCode}
            onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="ECE">ECE</SelectItem>
              <SelectItem value="ME">ME</SelectItem>
              <SelectItem value="CE">CE</SelectItem>
              <SelectItem value="EE">EE</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="MCA">MCA</SelectItem>
              <SelectItem value="MBA">MBA</SelectItem>
              <SelectItem value="BBA">BBA</SelectItem>
              <SelectItem value="BCA">BCA</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="degree">Degree</Label>
          <Select
            value={formData.degree}
            onValueChange={(value) => setFormData({ ...formData, degree: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTech">BTech</SelectItem>
              <SelectItem value="MTech">MTech</SelectItem>
              <SelectItem value="MCA">MCA</SelectItem>
              <SelectItem value="MBA">MBA</SelectItem>
              <SelectItem value="BBA">BBA</SelectItem>
              <SelectItem value="BCA">BCA</SelectItem>
              <SelectItem value="BE">BE</SelectItem>
              <SelectItem value="ME">ME</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="duration">Duration (years)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="6"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalCredits">Total Credits</Label>
          <Input
            id="totalCredits"
            type="number"
            min="120"
            max="200"
            value={formData.totalCredits}
            onChange={(e) => setFormData({ ...formData, totalCredits: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="maxStudents">Max Students</Label>
          <Input
            id="maxStudents"
            type="number"
            min="10"
            value={formData.maxStudents}
            onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hod">HOD</Label>
          <Select
            value={formData.hod}
            onValueChange={(value) => setFormData({ ...formData, hod: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select HOD" />
            </SelectTrigger>
            <SelectContent>
              {faculty.filter(f => f.role === 'dean').map((fac) => (
                <SelectItem key={fac._id} value={fac._id}>
                  {fac.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="coordinator">Coordinator</Label>
          <Select
            value={formData.coordinator}
            onValueChange={(value) => setFormData({ ...formData, coordinator: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select coordinator" />
            </SelectTrigger>
            <SelectContent>
              {faculty.filter(f => ['faculty', 'professor', 'teacher'].includes(f.role)).map((fac) => (
                <SelectItem key={fac._id} value={fac._id}>
                  {fac.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tuitionFee">Tuition Fee (₹)</Label>
          <Input
            id="tuitionFee"
            type="number"
            min="0"
            value={formData.tuitionFee}
            onChange={(e) => setFormData({ ...formData, tuitionFee: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="otherFees">Other Fees (₹)</Label>
          <Input
            id="otherFees"
            type="number"
            min="0"
            value={formData.otherFees}
            onChange={(e) => setFormData({ ...formData, otherFees: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="eligibility">Eligibility</Label>
        <Textarea
          id="eligibility"
          value={formData.eligibility}
          onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="admissionProcess">Admission Process</Label>
        <Textarea
          id="admissionProcess"
          value={formData.admissionProcess}
          onChange={(e) => setFormData({ ...formData, admissionProcess: e.target.value })}
        />
      </div>

      <DialogFooter>
        <Button type="submit">
          {initialData ? 'Update Course' : 'Create Course'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Subject Form Component
const SubjectForm: React.FC<{
  courseId: string;
  onSubmit: (data: any) => void;
  faculty: any[];
  initialData?: Subject | null;
}> = ({ courseId, onSubmit, faculty, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    credits: initialData?.credits || 4,
    semester: initialData?.semester || 1,
    year: initialData?.year || 1,
    instructor: initialData?.instructor?._id || '',
    isElective: initialData?.isElective || false,
    syllabus: initialData?.syllabus || '',
    objectives: initialData?.objectives || [],
    outcomes: initialData?.outcomes || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectData = {
      ...formData,
      courseId,
      objectives: formData.objectives.filter(obj => obj.trim() !== ''),
      outcomes: formData.outcomes.filter(out => out.trim() !== ''),
    };
    onSubmit(subjectData);
  };

  const addObjective = () => {
    setFormData({
      ...formData,
      objectives: [...formData.objectives, '']
    });
  };

  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      objectives: formData.objectives.filter((_, i) => i !== index)
    });
  };

  const addOutcome = () => {
    setFormData({
      ...formData,
      outcomes: [...formData.outcomes, '']
    });
  };

  const removeOutcome = (index: number) => {
    setFormData({
      ...formData,
      outcomes: formData.outcomes.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Subject Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="code">Subject Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="credits">Credits</Label>
          <Input
            id="credits"
            type="number"
            min="1"
            max="6"
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="semester">Semester</Label>
          <Input
            id="semester"
            type="number"
            min="1"
            max="8"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min="1"
            max="4"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="instructor">Instructor</Label>
        <Select
          value={formData.instructor}
          onValueChange={(value) => setFormData({ ...formData, instructor: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select instructor" />
          </SelectTrigger>
          <SelectContent>
            {faculty.map((fac) => (
              <SelectItem key={fac._id} value={fac._id}>
                {fac.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="syllabus">Syllabus</Label>
        <Textarea
          id="syllabus"
          value={formData.syllabus}
          onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
        />
      </div>

      <div>
        <Label>Objectives</Label>
        {formData.objectives.map((objective, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={objective}
              onChange={(e) => {
                const newObjectives = [...formData.objectives];
                newObjectives[index] = e.target.value;
                setFormData({ ...formData, objectives: newObjectives });
              }}
              placeholder="Enter objective"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeObjective(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addObjective}>
          Add Objective
        </Button>
      </div>

      <div>
        <Label>Outcomes</Label>
        {formData.outcomes.map((outcome, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={outcome}
              onChange={(e) => {
                const newOutcomes = [...formData.outcomes];
                newOutcomes[index] = e.target.value;
                setFormData({ ...formData, outcomes: newOutcomes });
              }}
              placeholder="Enter outcome"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeOutcome(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addOutcome}>
          Add Outcome
        </Button>
      </div>

      <DialogFooter>
        <Button type="submit">
          {initialData ? 'Update Subject' : 'Create Subject'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CourseManagement;
