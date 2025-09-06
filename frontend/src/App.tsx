import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import Fees from "./pages/Fees";
import Grades from "./pages/Grades";
import Messages from "./pages/Messages";
import Attendance from "./pages/Attendance";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Assignments from "./pages/Assignments";
import Exams from "./pages/Exams";
import Timetable from "./pages/Timetable";
import AIFeatures from "./pages/AIFeatures";
import AIProjects from "./pages/AIProjects";
import AdminPanel from "./pages/AdminPanel";
import ApprovalManagement from "./pages/ApprovalManagement";
import Dashboard from "./components/Dashboard/Dashboard";
import AIChatbot from "./components/AI/AIChatbot";
import {
  SidebarProvider,
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarInset,
  SidebarHeader,
  SidebarSeparator
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Calendar,
  FileText,
  MessageSquare,
  CreditCard,
  Home,
  LogIn,
  User,
  Settings as SettingsIcon,
  Sparkles,
  Code,
  TrendingUp,
  HelpCircle,
  AlertTriangle,
  Bell,
  BarChart3,
  Library,
  Calendar as CalendarIcon,
  Users,
  ClipboardList,
  BookMarked,
  GraduationCap,
  Award,
  Clock,
  FileCheck,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Heart,
  Shield,
  Zap,
  Target,
  PieChart,
  Activity,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Sun,
  Moon,
  UserCheck
} from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  
  // Sidebar slider states
  const [volumeSlider, setVolumeSlider] = useState([70]);
  const [brightnessSlider, setBrightnessSlider] = useState([80]);
  const [notificationsSlider, setNotificationsSlider] = useState([60]);
  
  const navigate = (path: string) => {
    if (location.pathname !== path) {
      window.location.href = path;
    }
  };
  
  // Check if we're on the auth page
  const isAuthPage = location.pathname === "/auth";
  
  // Initialize theme on app mount - default to light mode
  React.useEffect(() => {
    // Check if theme preference is stored in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      // Default to light mode
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  // Function to toggle theme
  const toggleTheme = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <SidebarProvider>
        <div className="flex h-full w-full">
          {/* Show sidebar on all pages - Force visibility */}
          <div className="glassmorphism-sidebar w-64 flex-shrink-0 flex flex-col h-screen overflow-y-auto overflow-x-hidden" style={{display: 'flex', visibility: 'visible', opacity: 1, zIndex: 1000}}>
              <SidebarHeader className="sidebar-header p-4">
                <div className="flex items-center justify-between w-full mb-4">
                  <span className="text-xl font-bold text-slate-100 drop-shadow-sm pl-2 pt-2 pb-2">Student ERP</span>
                  {user && <UserProfile />}
                </div>
                
                {/* Theme Converter */}
                <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-4">
                  <div className="flex items-center space-x-2">
                    {darkMode ? <Moon className="h-4 w-4 text-slate-300" /> : <Sun className="h-4 w-4 text-yellow-400" />}
                    <div>
                      <p className="text-xs font-medium text-slate-200">Theme</p>
                      <p className="text-xs text-slate-400">
                        {darkMode ? 'Dark mode' : 'Light mode'}
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                {/* Sidebar Sliders */}
                <div className="space-y-4">
                  {/* Volume Control */}
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-slate-300" />
                        <span className="text-xs font-medium text-slate-200">Volume</span>
                      </div>
                      <span className="text-xs text-slate-400">{volumeSlider[0]}%</span>
                    </div>
                    <Slider
                      value={volumeSlider}
                      onValueChange={setVolumeSlider}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Brightness Control */}
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4 text-slate-300" />
                        <span className="text-xs font-medium text-slate-200">Brightness</span>
                      </div>
                      <span className="text-xs text-slate-400">{brightnessSlider[0]}%</span>
                    </div>
                    <Slider
                      value={brightnessSlider}
                      onValueChange={setBrightnessSlider}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Notifications Control */}
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-slate-300" />
                        <span className="text-xs font-medium text-slate-200">Notifications</span>
                      </div>
                      <span className="text-xs text-slate-400">{notificationsSlider[0]}%</span>
                    </div>
                    <Slider
                      value={notificationsSlider}
                      onValueChange={setNotificationsSlider}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </SidebarHeader>
              <SidebarSeparator className="sidebar-separator" />
              <SidebarContent className="sidebar-content">
                <SidebarMenu>
                  {/* Main Navigation */}
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/"} 
                      onClick={() => navigate("/")}
                      className={`sidebar-menu-button ${location.pathname === "/" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-home">
                        <Home className="h-5 w-5" />
                      </div>
                      <span> Home </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/dashboard"} 
                      onClick={() => navigate("/dashboard")}
                      className={`sidebar-menu-button ${location.pathname === "/dashboard" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-dashboard">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <span> Dashboard </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Academic Section */}
                  <SidebarSeparator className="sidebar-separator" />
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Academic
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/courses"} 
                      onClick={() => navigate("/courses")}
                      className={`sidebar-menu-button ${location.pathname === "/courses" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-courses">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <span> My Courses </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/attendance"} 
                      onClick={() => navigate("/attendance")}
                      className={`sidebar-menu-button ${location.pathname === "/attendance" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-attendance">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <span> Attendance </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/grades"} 
                      onClick={() => navigate("/grades")}
                      className={`sidebar-menu-button ${location.pathname === "/grades" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-grades">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span> Grades & Results </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/assignments"} 
                      onClick={() => navigate("/assignments")}
                      className={`sidebar-menu-button ${location.pathname === "/assignments" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-assignments">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <span> Assignments </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/exams"} 
                      onClick={() => navigate("/exams")}
                      className={`sidebar-menu-button ${location.pathname === "/exams" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-exams">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <span> Exams & Tests </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/timetable"} 
                      onClick={() => navigate("/timetable")}
                      className={`sidebar-menu-button ${location.pathname === "/timetable" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-timetable">
                        <Clock className="h-5 w-5" />
                      </div>
                      <span> Timetable </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Student Services */}
                  <SidebarSeparator className="sidebar-separator" />
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Services
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/library"} 
                      onClick={() => navigate("/library")}
                      className={`sidebar-menu-button ${location.pathname === "/library" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-library">
                        <Library className="h-5 w-5" />
                      </div>
                      <span> Library </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/events"} 
                      onClick={() => navigate("/events")}
                      className={`sidebar-menu-button ${location.pathname === "/events" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-events">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <span> Events & Activities </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/tuition"} 
                      onClick={() => navigate("/tuition")}
                      className={`sidebar-menu-button ${location.pathname === "/tuition" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-fees">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <span> Pay Fees </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/scholarships"} 
                      onClick={() => navigate("/scholarships")}
                      className={`sidebar-menu-button ${location.pathname === "/scholarships" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-scholarships">
                        <Award className="h-5 w-5" />
                      </div>
                      <span> Scholarships </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Communication */}
                  <SidebarSeparator className="sidebar-separator" />
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Communication
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/messages"} 
                      onClick={() => navigate("/messages")}
                      className={`sidebar-menu-button ${location.pathname === "/messages" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-messages">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <span> Messages </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/notifications"} 
                      onClick={() => navigate("/notifications")}
                      className={`sidebar-menu-button ${location.pathname === "/notifications" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-notifications">
                        <Bell className="h-5 w-5" />
                      </div>
                      <span> Notifications </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/announcements"} 
                      onClick={() => navigate("/announcements")}
                      className={`sidebar-menu-button ${location.pathname === "/announcements" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-announcements">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <span> Announcements </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Analytics & Reports */}
                  <SidebarSeparator className="sidebar-separator" />
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Analytics
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/reports"} 
                      onClick={() => navigate("/reports")}
                      className={`sidebar-menu-button ${location.pathname === "/reports" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-reports">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <span> Reports </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/analytics"} 
                      onClick={() => navigate("/analytics")}
                      className={`sidebar-menu-button ${location.pathname === "/analytics" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-analytics">
                        <PieChart className="h-5 w-5" />
                      </div>
                      <span> Analytics </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/performance"} 
                      onClick={() => navigate("/performance")}
                      className={`sidebar-menu-button ${location.pathname === "/performance" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-performance">
                        <Activity className="h-5 w-5" />
                      </div>
                      <span> Performance </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* AI Features Section */}
                  <SidebarSeparator className="sidebar-separator" />
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    AI Features
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/ai-features"} 
                      onClick={() => navigate("/ai-features")}
                      className={`sidebar-menu-button ${location.pathname === "/ai-features" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-ai-features">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <span> AI Features </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/ai-projects"} 
                      onClick={() => navigate("/ai-projects")}
                      className={`sidebar-menu-button ${location.pathname === "/ai-projects" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-ai-projects">
                        <Code className="h-5 w-5" />
                      </div>
                      <span> AI Projects </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/ai-tutor"} 
                      onClick={() => navigate("/ai-tutor")}
                      className={`sidebar-menu-button ${location.pathname === "/ai-tutor" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-ai-tutor">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <span> AI Tutor </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Admin Section */}
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <>
                      <SidebarSeparator className="sidebar-separator" />
                      <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Administration
                      </div>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={location.pathname === "/admin-panel"} 
                          onClick={() => navigate("/admin-panel")}
                          className={`sidebar-menu-button ${location.pathname === "/admin-panel" ? 'active' : ''}`}
                        > 
                          <div className="icon-container icon-admin">
                            <Shield className="h-5 w-5" />
                          </div>
                          <span> Admin Panel </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={location.pathname === "/approvals"} 
                          onClick={() => navigate("/approvals")}
                          className={`sidebar-menu-button ${location.pathname === "/approvals" ? 'active' : ''}`}
                        > 
                          <div className="icon-container icon-approvals">
                            <UserCheck className="h-5 w-5" />
                          </div>
                          <span> Approvals </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}

                  {/* User Account Section */}
                  <SidebarSeparator className="sidebar-separator" />
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Account
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/profile"} 
                      onClick={() => navigate("/profile")}
                      className={`sidebar-menu-button ${location.pathname === "/profile" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-profile">
                        <User className="h-5 w-5" />
                      </div>
                      <span> Profile </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/settings"} 
                      onClick={() => navigate("/settings")}
                      className={`sidebar-menu-button ${location.pathname === "/settings" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-settings">
                        <SettingsIcon className="h-5 w-5" />
                      </div>
                      <span> Settings </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/help"} 
                      onClick={() => navigate("/help")}
                      className={`sidebar-menu-button ${location.pathname === "/help" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-help">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <span> Help & Support </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {/* Authentication Section */}
                  <SidebarSeparator className="sidebar-separator" />
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === "/auth"} 
                      onClick={() => navigate("/auth")}
                      className={`sidebar-menu-button ${location.pathname === "/auth" ? 'active' : ''}`}
                    > 
                      <div className="icon-container icon-signin">
                        <LogIn className="h-5 w-5" />
                      </div>
                      <span> {user ? 'Account' : 'Sign In'} </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                </SidebarMenu>
              </SidebarContent>
            </div>
          
          {/* Main content area */}
          <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ml-64">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
              <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/tuition" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
              <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
              <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
              <Route path="/ai-features" element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
              <Route path="/ai-projects" element={<ProtectedRoute><AIProjects /></ProtectedRoute>} />
              <Route path="/admin-panel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              <Route path="/approvals" element={<ProtectedRoute><ApprovalManagement /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
        <AIChatbot />
      </SidebarProvider>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
