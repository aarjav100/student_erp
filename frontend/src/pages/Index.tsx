import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  // Initialize theme on component mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  // Function to toggle theme
  const toggleTheme = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
    { time: '8:00 AM', monday: 'Math 101', tuesday: 'Physics 201', wednesday: 'Chemistry 301', thursday: 'History 102', friday: 'English 202' },
    { time: '9:00 AM', monday: 'Physics 201', tuesday: 'Chemistry 301', wednesday: 'History 102', thursday: 'English 202', friday: 'Math 101' },
    { time: '10:00 AM', monday: 'Chemistry 301', tuesday: 'History 102', wednesday: 'English 202', thursday: 'Math 101', friday: 'Physics 201' },
    { time: '12:00 PM', monday: 'Lunch', tuesday: 'Lunch', wednesday: 'Lunch', thursday: 'Lunch', friday: 'Lunch' },
    { time: '1:00 PM', monday: 'History 102', tuesday: 'English 202', wednesday: 'Math 101', thursday: 'Physics 201', friday: 'Chemistry 301' },
    { time: '2:00 PM', monday: 'English 202', tuesday: 'Math 101', wednesday: 'Physics 201', thursday: 'Chemistry 301', friday: 'History 102' },
    { time: '3:00 PM', monday: 'Computer Science 101', tuesday: 'Free', wednesday: 'Free', thursday: 'Free', friday: 'Free' }
  ];

  const tasks = [
    { id: 1, text: 'Submit Math Assignment', completed: true },
    { id: 2, text: 'Prepare for Chemistry Lab', completed: false },
    { id: 3, text: 'Review History Notes', completed: false }
  ];

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-xl text-white/80 mb-6">
            Today is {getCurrentDate()}
          </p>
          <Button 
            className="bg-white text-blue-600 hover:bg-white/90 px-8 py-3 rounded-full font-semibold"
            onClick={() => navigate('/profile')}
          >
            View Profile
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Attendance %</p>
              <p className="text-3xl font-bold text-white">92%</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">GPA</p>
              <p className="text-3xl font-bold text-white">3.8</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Upcoming Classes</p>
              <p className="text-3xl font-bold text-white">2</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Pending Assignments</p>
              <p className="text-3xl font-bold text-white">3</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timetable */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Timetable</h2>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-white font-semibold">Time</th>
                    <th className="text-left p-3 text-white font-semibold">Monday</th>
                    <th className="text-left p-3 text-white font-semibold">Tuesday</th>
                    <th className="text-left p-3 text-white font-semibold">Wednesday</th>
                    <th className="text-left p-3 text-white font-semibold">Thursday</th>
                    <th className="text-left p-3 text-white font-semibold">Friday</th>
                  </tr>
                </thead>
                <tbody>
                  {timetableData.map((row, index) => (
                    <tr key={index} className="border-b border-border/30">
                      <td className="p-3 text-white font-medium">{row.time}</td>
                      <td className="p-3 text-white">{row.monday}</td>
                      <td className="p-3 text-white">{row.tuesday}</td>
                      <td className="p-3 text-white">{row.wednesday}</td>
                      <td className="p-3 text-white">{row.thursday}</td>
                      <td className="p-3 text-white">{row.friday}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Trend */}
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Performance Trend</h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">+12%</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Last 30 Days</p>
              <div className="flex items-end space-x-2 h-24">
                <div className="flex-1 bg-primary/30 rounded-t" style={{height: '60%'}}></div>
                <div className="flex-1 bg-primary/30 rounded-t" style={{height: '80%'}}></div>
                <div className="flex-1 bg-primary/30 rounded-t" style={{height: '45%'}}></div>
                <div className="flex-1 bg-primary/30 rounded-t" style={{height: '90%'}}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Trend */}
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Attendance Trend</h3>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">-5%</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Last 30 Days</p>
              <div className="flex items-end space-x-2 h-24">
                <div className="flex-1 bg-muted rounded-t" style={{height: '85%'}}></div>
                <div className="flex-1 bg-muted rounded-t" style={{height: '90%'}}></div>
                <div className="flex-1 bg-muted rounded-t" style={{height: '75%'}}></div>
                <div className="flex-1 bg-muted rounded-t" style={{height: '80%'}}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Announcements */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Announcements</h2>
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-0">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">Important Exam Dates</h3>
            <p className="text-white/80">
              Midterm exams are scheduled for the week of Aug. 12th. Please check the detailed schedule on the portal.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Upcoming Events</h2>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">July 2024</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="p-2 text-sm text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
              {Array.from({length: 31}, (_, i) => (
                <div 
                  key={i + 1} 
                  className={`p-2 text-sm cursor-pointer rounded-full ${
                    i === 0 ? 'bg-primary text-primary-foreground' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Tasks</h2>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-6">
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={`text-white ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50">
        <div>
          <p className="text-white font-medium">Theme Mode</p>
          <p className="text-sm text-muted-foreground">
            {darkMode ? 'Currently in dark mode' : 'Currently in light mode'}
          </p>
        </div>
        <Switch 
          checked={darkMode} 
          onCheckedChange={toggleTheme}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
};

export default Index;
