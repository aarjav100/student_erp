import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Eye, EyeOff, Lock, Mail, User, Phone, Hash, Shield, FileText, MessageSquare, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [testId, setTestId] = useState('');
  const [detectedRole, setDetectedRole] = useState('');
  const [role, setRole] = useState('');
  const [course, setCourse] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // OTP login state
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  
  
  const { signIn, signUp, sendOTP } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Role and Course options
  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'professor', label: 'Professor' },
    { value: 'assistant-professor', label: 'Assistant Professor' },
    { value: 'associate-professor', label: 'Associate Professor' },
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staff' },
    { value: 'librarian', label: 'Librarian' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'hr', label: 'HR Personnel' },
    { value: 'registrar', label: 'Registrar' },
    { value: 'dean', label: 'Dean' },
    { value: 'principal', label: 'Principal' },
    { value: 'vice-principal', label: 'Vice Principal' },
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'counselor', label: 'Counselor' },
    { value: 'security', label: 'Security Personnel' },
    { value: 'maintenance', label: 'Maintenance Staff' },
    { value: 'guest', label: 'Guest Faculty' }
  ];

  const courseOptions = [
    // Engineering Courses
    { value: 'btech-cs', label: 'B.Tech Computer Science' },
    { value: 'btech-it', label: 'B.Tech Information Technology' },
    { value: 'btech-ece', label: 'B.Tech Electronics & Communication' },
    { value: 'btech-me', label: 'B.Tech Mechanical Engineering' },
    { value: 'btech-ce', label: 'B.Tech Civil Engineering' },
    { value: 'btech-ee', label: 'B.Tech Electrical Engineering' },
    { value: 'btech-cse', label: 'B.Tech Computer Science & Engineering' },
    { value: 'btech-ae', label: 'B.Tech Aerospace Engineering' },
    { value: 'btech-biotech', label: 'B.Tech Biotechnology' },
    { value: 'btech-chemical', label: 'B.Tech Chemical Engineering' },
    { value: 'btech-textile', label: 'B.Tech Textile Engineering' },
    { value: 'btech-food', label: 'B.Tech Food Technology' },
    { value: 'btech-agricultural', label: 'B.Tech Agricultural Engineering' },
    { value: 'btech-mining', label: 'B.Tech Mining Engineering' },
    { value: 'btech-metallurgy', label: 'B.Tech Metallurgical Engineering' },
    { value: 'btech-industrial', label: 'B.Tech Industrial Engineering' },
    { value: 'btech-production', label: 'B.Tech Production Engineering' },
    { value: 'btech-automobile', label: 'B.Tech Automobile Engineering' },
    { value: 'btech-marine', label: 'B.Tech Marine Engineering' },
    { value: 'btech-petroleum', label: 'B.Tech Petroleum Engineering' },
    
    // Management Courses
    { value: 'mba', label: 'MBA (Master of Business Administration)' },
    { value: 'bba', label: 'BBA (Bachelor of Business Administration)' },
    { value: 'mba-finance', label: 'MBA Finance' },
    { value: 'mba-marketing', label: 'MBA Marketing' },
    { value: 'mba-hr', label: 'MBA Human Resources' },
    { value: 'mba-operations', label: 'MBA Operations' },
    { value: 'mba-international', label: 'MBA International Business' },
    { value: 'mba-digital', label: 'MBA Digital Marketing' },
    { value: 'mba-healthcare', label: 'MBA Healthcare Management' },
    { value: 'mba-tourism', label: 'MBA Tourism & Hospitality' },
    { value: 'pgdm', label: 'PGDM (Post Graduate Diploma in Management)' },
    { value: 'pgp', label: 'PGP (Post Graduate Program)' },
    
    // Computer Applications
    { value: 'bca', label: 'BCA (Bachelor of Computer Applications)' },
    { value: 'mca', label: 'MCA (Master of Computer Applications)' },
    { value: 'bsc-cs', label: 'B.Sc Computer Science' },
    { value: 'msc-cs', label: 'M.Sc Computer Science' },
    { value: 'bsc-it', label: 'B.Sc Information Technology' },
    { value: 'msc-it', label: 'M.Sc Information Technology' },
    { value: 'btech-ai', label: 'B.Tech Artificial Intelligence' },
    { value: 'btech-cyber', label: 'B.Tech Cybersecurity' },
    { value: 'btech-data', label: 'B.Tech Data Science' },
    { value: 'btech-cloud', label: 'B.Tech Cloud Computing' },
    
    // Medical & Health Sciences
    { value: 'mbbs', label: 'MBBS (Bachelor of Medicine & Surgery)' },
    { value: 'bds', label: 'BDS (Bachelor of Dental Surgery)' },
    { value: 'bpharm', label: 'B.Pharm (Bachelor of Pharmacy)' },
    { value: 'mpharm', label: 'M.Pharm (Master of Pharmacy)' },
    { value: 'bpt', label: 'BPT (Bachelor of Physiotherapy)' },
    { value: 'bsc-nursing', label: 'B.Sc Nursing' },
    { value: 'msc-nursing', label: 'M.Sc Nursing' },
    { value: 'bsc-medical', label: 'B.Sc Medical Technology' },
    
    // Arts & Humanities
    { value: 'ba', label: 'BA (Bachelor of Arts)' },
    { value: 'ma', label: 'MA (Master of Arts)' },
    { value: 'ba-english', label: 'BA English Literature' },
    { value: 'ba-history', label: 'BA History' },
    { value: 'ba-psychology', label: 'BA Psychology' },
    { value: 'ba-sociology', label: 'BA Sociology' },
    { value: 'ba-economics', label: 'BA Economics' },
    { value: 'ba-political', label: 'BA Political Science' },
    { value: 'ba-philosophy', label: 'BA Philosophy' },
    { value: 'ba-journalism', label: 'BA Journalism & Mass Communication' },
    
    // Science Courses
    { value: 'bsc', label: 'B.Sc (Bachelor of Science)' },
    { value: 'msc', label: 'M.Sc (Master of Science)' },
    { value: 'bsc-physics', label: 'B.Sc Physics' },
    { value: 'bsc-chemistry', label: 'B.Sc Chemistry' },
    { value: 'bsc-mathematics', label: 'B.Sc Mathematics' },
    { value: 'bsc-biology', label: 'B.Sc Biology' },
    { value: 'bsc-botany', label: 'B.Sc Botany' },
    { value: 'bsc-zoology', label: 'B.Sc Zoology' },
    { value: 'bsc-geology', label: 'B.Sc Geology' },
    { value: 'bsc-environmental', label: 'B.Sc Environmental Science' },
    
    // Commerce & Finance
    { value: 'bcom', label: 'B.Com (Bachelor of Commerce)' },
    { value: 'mcom', label: 'M.Com (Master of Commerce)' },
    { value: 'bcom-hons', label: 'B.Com (Hons)' },
    { value: 'ca', label: 'CA (Chartered Accountant)' },
    { value: 'cfa', label: 'CFA (Chartered Financial Analyst)' },
    { value: 'cma', label: 'CMA (Cost & Management Accountant)' },
    { value: 'bsc-finance', label: 'B.Sc Finance' },
    { value: 'msc-finance', label: 'M.Sc Finance' },
    
    // Law
    { value: 'llb', label: 'LLB (Bachelor of Laws)' },
    { value: 'llm', label: 'LLM (Master of Laws)' },
    { value: 'ba-llb', label: 'BA LLB (Integrated)' },
    { value: 'bcom-llb', label: 'B.Com LLB (Integrated)' },
    
    // Education
    { value: 'bed', label: 'B.Ed (Bachelor of Education)' },
    { value: 'med', label: 'M.Ed (Master of Education)' },
    { value: 'diet', label: 'DIET (Diploma in Elementary Education)' },
    { value: 'bsc-ed', label: 'B.Sc Education' },
    
    // Architecture & Design
    { value: 'barch', label: 'B.Arch (Bachelor of Architecture)' },
    { value: 'march', label: 'M.Arch (Master of Architecture)' },
    { value: 'bdes', label: 'B.Des (Bachelor of Design)' },
    { value: 'mdes', label: 'M.Des (Master of Design)' },
    { value: 'bfa', label: 'BFA (Bachelor of Fine Arts)' },
    { value: 'mfa', label: 'MFA (Master of Fine Arts)' },
    
    // Agriculture
    { value: 'bsc-agriculture', label: 'B.Sc Agriculture' },
    { value: 'msc-agriculture', label: 'M.Sc Agriculture' },
    { value: 'btech-agriculture', label: 'B.Tech Agriculture' },
    { value: 'bsc-horticulture', label: 'B.Sc Horticulture' },
    
    // Research & Doctoral
    { value: 'phd', label: 'PhD (Doctor of Philosophy)' },
    { value: 'phd-cs', label: 'PhD Computer Science' },
    { value: 'phd-management', label: 'PhD Management' },
    { value: 'phd-engineering', label: 'PhD Engineering' },
    { value: 'phd-science', label: 'PhD Science' },
    
    // Diploma & Certificate
    { value: 'diploma', label: 'Diploma Course' },
    { value: 'diploma-engineering', label: 'Diploma in Engineering' },
    { value: 'diploma-management', label: 'Diploma in Management' },
    { value: 'diploma-computer', label: 'Diploma in Computer Applications' },
    { value: 'certificate', label: 'Certificate Course' },
    { value: 'certificate-programming', label: 'Certificate in Programming' },
    { value: 'certificate-digital', label: 'Certificate in Digital Marketing' },
    { value: 'certificate-graphic', label: 'Certificate in Graphic Design' }
  ];


  // Function to detect role from email
  const detectRoleFromEmail = (email) => {
    const emailLower = email.toLowerCase();
    
    if (emailLower.includes('admin') && emailLower.includes('@college.edu')) {
      return 'admin';
    }
    if (emailLower.includes('@teacher.college.edu') || 
        emailLower.includes('@faculty.college.edu') ||
        emailLower.includes('@prof.college.edu')) {
      return 'teacher';
    }
    if (emailLower.includes('@student.college.edu') || 
        emailLower.includes('@college.edu')) {
      return 'student';
    }
    
    return 'student'; // Default fallback
  };

  // Function to check if test ID is required - No longer required for any role
  const isTestIdRequired = (role) => {
    return false; // Test ID is no longer required for any role
  };

  // Effect to detect role when email changes
  useEffect(() => {
    if (email) {
      const role = detectRoleFromEmail(email);
      setDetectedRole(role);
    } else {
      setDetectedRole('');
    }
  }, [email]);

  // Sample data for dropdowns
  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'hod', label: 'HOD' },
    { value: 'staff', label: 'Staff' }
  ];

  const courses = [
    { value: 'btech', label: 'B.Tech' },
    { value: 'mtech', label: 'M.Tech' },
    { value: 'bca', label: 'BCA' },
    { value: 'mca', label: 'MCA' },
    { value: 'bba', label: 'BBA' },
    { value: 'mba', label: 'MBA' },
    { value: 'phd', label: 'PhD' },
    { value: 'diploma', label: 'Diploma' }
  ];

  const branches = [
    { value: 'cse', label: 'Computer Science Engineering' },
    { value: 'ece', label: 'Electronics & Communication' },
    { value: 'me', label: 'Mechanical Engineering' },
    { value: 'ce', label: 'Civil Engineering' },
    { value: 'ee', label: 'Electrical Engineering' },
    { value: 'it', label: 'Information Technology' },
    { value: 'ai', label: 'Artificial Intelligence' },
    { value: 'ds', label: 'Data Science' },
    { value: 'cyber', label: 'Cybersecurity' },
    { value: 'biotech', label: 'Biotechnology' }
  ];


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let error = null;
    
    if (loginMode === 'otp') {
      // For OTP login, we'll use the existing OTP verification
      // In a real implementation, you'd have a separate user OTP login endpoint
      if (!otpSent || !otp) {
        error = 'Please send and enter OTP first';
      } else {
        // This is a placeholder - you'd need to implement user OTP login
        // For now, we'll show an error message
        error = 'OTP login for regular users is not yet implemented. Please use password login.';
      }
    } else {
      // Handle password login
      const result = await signIn(email, password);
      error = result?.error;
    }

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword || !role || !course) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Check password length
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Test ID is no longer required for any role
    
    setLoading(true);

    const { error, message } = await signUp(name, email, password, testId, role, course);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else if (message) {
      toast({
        title: "Success",
        description: message,
      });
    }

    setLoading(false);
  };




  const handleSendOTP = async () => {
    if (!email) {
      toast({ title: 'Error', description: 'Please enter your email first', variant: 'destructive' });
      return;
    }

    setOtpLoading(true);
    const { error } = await sendOTP(email);
    
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      setOtpSent(true);
      toast({ title: 'OTP Sent', description: 'Check your email for the code.' });
    }
    
    setOtpLoading(false);
  };

  const resetOTPLogin = () => {
    setOtpSent(false);
    setOtp('');
    setLoginMode('password');
  };




  return (
    <div className="h-full w-full bg-gradient-to-b from-sky-100 via-sky-50 to-white p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="max-w-md mx-auto">
        {/* Header */}
          <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student ERP System</h1>
          <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
          </div>


        {/* Auth Card */}
        <Card className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl">
            <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full" onValueChange={v => setTab(v as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
                </TabsList>
                
              {/* Sign In Form */}
              <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {/* Login Mode Toggle */}
                  <div className="flex justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setLoginMode('password')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          loginMode === 'password'
                          ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMode('otp')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          loginMode === 'otp'
                          ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        OTP
                      </button>
                    </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    {loginMode === 'password' ? (
                      /* Password Login */
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {/* Remember me and Forgot Password */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              id="remember-me"
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          <Label htmlFor="remember-me" className="text-sm text-gray-600">Remember me</Label>
                          </div>
                        <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                            Forgot Password?
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* OTP Login */
                    <div className="space-y-4">
                        {!otpSent ? (
                            <Button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={otpLoading || !email}
                          className="w-full h-11"
                            >
                              {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                        ) : (
                          <>
                          <div className="space-y-2">
                            <Label htmlFor="signin-otp">OTP Code</Label>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="signin-otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                className="pl-10 h-11"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between">
                              <button
                                type="button"
                                onClick={resetOTPLogin}
                              className="text-sm text-gray-600 hover:text-gray-800"
                              >
                                ← Back to Password
                              </button>
                              <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={otpLoading}
                              className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Resend OTP
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
              {/* Sign Up Form */}
              <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your college email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 h-11"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Use any valid email address (e.g., yourname@gmail.com, yourname@yahoo.com, yourname@company.com)
                      </p>
                      {detectedRole && (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-600 font-medium">
                            Detected Role: {detectedRole.charAt(0).toUpperCase() + detectedRole.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Test ID Field - Only show for admin/teacher roles */}
                    {detectedRole && isTestIdRequired(detectedRole) && (
                      <div className="space-y-2">
                        <Label htmlFor="test-id">Test ID (Required for {detectedRole.charAt(0).toUpperCase() + detectedRole.slice(1)})</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="test-id"
                            type="text"
                            placeholder="Enter test ID provided by Registration Block"
                            value={testId}
                            onChange={(e) => setTestId(e.target.value)}
                            required
                            className="pl-10 h-11"
                          />
                        </div>
                        <p className="text-xs text-amber-600">
                          Contact the Registration Block for the correct test ID for {detectedRole} role.
                        </p>
                      </div>
                    )}

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 pr-10 h-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="pl-10 h-11"
                        />
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>

                    {/* Role Field */}
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select 
                        id="role"
                        value={role} 
                        onChange={(e) => setRole(e.target.value)} 
                        required
                        className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select your role</option>
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Course Field */}
                    <div className="space-y-2">
                      <Label htmlFor="course">Select a course</Label>
                      <select 
                        id="course"
                        value={course} 
                        onChange={(e) => setCourse(e.target.value)} 
                        required
                        className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a course</option>
                        {courseOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                  <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
                
              </Tabs>
            </CardContent>
          </Card>

          {/* Sign Up Link */}
        <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => setTab('signup')}
              className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up here
              </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;