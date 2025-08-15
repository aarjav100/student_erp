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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen" style={{paddingTop: '10px'}}>
        <Sidebar className="glassmorphism-sidebar" style={{background: 'linear-gradient(180deg, rgba(37, 25, 54, 0.85), rgba(20, 14, 32, 0.9))', borderRight: '1px solid hsl(248 22% 20%)'}}>
          <SidebarHeader className="sidebar-header p-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xl font-bold text-white drop-shadow-sm pl-2 pt-2 pb-2">Student ERP</span>
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
        <div className="main-content-area dashboard-container" style={{marginLeft: '260px', width: 'calc(100% - 260px)', height: '100vh', paddingLeft: '0', paddingRight: '5px'}}>
          <div className="relative w-full h-full overflow-hidden" style={{background: 'linear-gradient(180deg, hsl(248 24% 9%), hsl(248 22% 13%))'}}>
            {/* Enhanced background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full blur-3xl" style={{background: 'radial-gradient(circle at 30% 30%, hsl(265 85% 66% / .18), transparent 60%)'}}></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{background: 'radial-gradient(circle at 20% 80%, hsl(280 85% 70% / .14), transparent 55%)'}}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{background: 'radial-gradient(circle at 50% 50%, hsl(200 65% 55% / .10), transparent 60%)'}}></div>
            </div>
            
            {/* Main content container */}
            <div className="relative z-10 w-full h-full p-0">
              <div className="w-full h-full rounded-xl shadow-2xl border border-[hsl(248_22%_20%)]/60 dashboard-content" style={{background: 'linear-gradient(180deg, hsl(248 20% 12% / .85), hsl(248 22% 10% / .85))', backdropFilter: 'blur(6px)'}}>
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
