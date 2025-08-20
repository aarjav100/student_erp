import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AIFeatures from "./pages/AIFeatures";
import AIProjects from "./pages/AIProjects";
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
  Code
} from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const location = window.location;
  const navigate = (path: string) => window.location.pathname !== path && (window.location.href = path);
  
  // Initialize theme on app mount - default to light mode
  React.useEffect(() => {
    // Check if theme preference is stored in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      // Default to light mode
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{paddingTop: '0'}}>
        <Sidebar className="glassmorphism-sidebar">
          <SidebarHeader className="sidebar-header p-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xl font-bold text-slate-100 drop-shadow-sm pl-2 pt-2 pb-2">Student ERP</span>
              {user && <UserProfile />}
            </div>
          </SidebarHeader>
          <SidebarSeparator className="sidebar-separator" />
          <SidebarContent className="sidebar-content">
            <SidebarMenu>
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
                  <span> Grades </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
              {user && (
                <>
                  <SidebarSeparator className="sidebar-separator" />
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
                </>
              )}
              {!user && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate("/auth")}
                    className="sidebar-menu-button"
                  > 
                    <div className="icon-container icon-signin">
                      <LogIn className="h-5 w-5" />
                    </div>
                    <span> Sign In </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="main-content-area dashboard-container" style={{marginLeft: '260px', width: 'calc(100% - 260px)', height: '100vh', paddingLeft: '0', paddingRight: '0'}}>
          <div className="relative w-full h-full overflow-hidden">
            {/* Enhanced background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Light mode decorative elements */}
              <div className="light-mode-decoration absolute -top-32 -right-24 w-80 h-80 rounded-full blur-3xl"></div>
              <div className="light-mode-decoration absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"></div>
              <div className="light-mode-decoration absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"></div>
              
              {/* Dark mode decorative elements */}
              <div className="dark-mode-decoration absolute -top-32 -right-24 w-80 h-80 rounded-full blur-3xl"></div>
              <div className="dark-mode-decoration absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"></div>
              <div className="dark-mode-decoration absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"></div>
            </div>
            
            {/* Main content container */}
            <div className="relative z-10 w-full h-full p-0">
              <div className="w-full h-full rounded-xl shadow-2xl dashboard-content">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
                  <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/tuition" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
                  <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/ai-features" element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
                  <Route path="/ai-projects" element={<ProtectedRoute><AIProjects /></ProtectedRoute>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
        <AIChatbot />
      </div>
    </SidebarProvider>
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
