import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Eye, EyeOff, Lock, Mail, User, Phone, Hash, Shield, BookOpen, Home, Calendar, FileText, MessageSquare, CreditCard, Settings as SettingsIcon, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  
  // New signup fields
  const [role, setRole] = useState('student');
  const [course, setCourse] = useState('');
  const [branch, setBranch] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // OTP login state
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Admin OTP state
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  
  const { signIn, signUp, adminSignIn, adminOTP, sendOTP } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<'signin' | 'signup' | 'admin'>('signin');
  // Admin 2FA state
  const [adminStep, setAdminStep] = useState<'login' | 'otp'>('login');
  const [adminOtp, setAdminOtp] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminTrust, setAdminTrust] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Sample data for dropdowns
  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'hod', label: 'HOD' },
    { value: 'admin', label: 'Admin' },
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

  useEffect(() => {
    if (tab === 'admin' && document.cookie.includes('trusted_admin_device=1')) {
      // Skip OTP, log in admin directly
      toast({ title: 'Success', description: 'Trusted device: Admin login successful!' });
      // Set admin session, redirect, etc.
    }
  }, [tab, toast]);

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
    
    // Validation for roles that require course and branch
    if ((role === 'student' || role === 'faculty' || role === 'hod') && (!course || !branch)) {
      toast({
        title: "Validation Error",
        description: "Course and Branch are required for students, faculty, and HOD",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    const { error } = await signUp(email, password, firstName, lastName, studentId || undefined, phone || undefined, role, course, branch);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    
    let error = null;
    
    if (adminStep === 'otp') {
      // Handle admin OTP verification
      const result = await adminOTP(adminEmail, adminOtp);
      error = result?.error;
      
      if (!error && adminTrust) {
        document.cookie = `trusted_admin_device=1; max-age=${30 * 24 * 60 * 60}; path=/; secure; samesite=strict`;
      }
    } else {
      // Handle admin password login
      const result = await adminSignIn(adminEmail, adminPassword);
      error = result?.error;
    }
    
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Admin login successful!' });
    }
    
    setAdminLoading(false);
  };

  const handleAdminOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    
    const result = await adminOTP(adminEmail, adminOtp);
    
    if (result?.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      if (adminTrust) {
        document.cookie = `trusted_admin_device=1; max-age=${30 * 24 * 60 * 60}; path=/; secure; samesite=strict`;
      }
      toast({ title: 'Success', description: 'Admin OTP verification successful!' });
    }
    
    setAdminLoading(false);
  };

  const handleSendAdminOTP = async () => {
    if (!adminEmail) {
      toast({ title: 'Error', description: 'Please enter admin email first', variant: 'destructive' });
      return;
    }

    setAdminLoading(true);
    const result = await sendOTP(adminEmail);
    
    if (result?.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      setAdminOtpSent(true);
      toast({ title: 'OTP Sent', description: 'Check your email for the admin verification code.' });
    }
    
    setAdminLoading(false);
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

  const resetAdminOTPLogin = () => {
    setAdminOtpSent(false);
    setAdminOtp('');
    setAdminStep('login');
  };

  const switchToAdminPassword = () => {
    setAdminStep('login');
    setAdminOtpSent(false);
    setAdminOtp('');
  };

  const switchToAdminOTP = () => {
    setAdminStep('otp');
    setAdminOtpSent(false);
    setAdminOtp('');
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-sky-100 via-sky-50 to-white p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="max-w-md mx-auto">
        {/* Header */}
          <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student ERP System</h1>
          <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
          </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <Link to="/" className="p-2 rounded-lg bg-white/70 backdrop-blur border border-white/60 hover:bg-white transition text-center">
            <Home className="h-4 w-4 mx-auto mb-1"/>
            <span className="text-xs">Home</span>
            </Link>
          <Link to="/dashboard" className="p-2 rounded-lg bg-white/70 backdrop-blur border border-white/60 hover:bg-white transition text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1"/>
            <span className="text-xs">Dashboard</span>
            </Link>
          <Link to="/courses" className="p-2 rounded-lg bg-white/70 backdrop-blur border border-white/60 hover:bg-white transition text-center">
            <BookOpen className="h-4 w-4 mx-auto mb-1"/>
            <span className="text-xs">Courses</span>
            </Link>
          <Link to="/attendance" className="p-2 rounded-lg bg-white/70 backdrop-blur border border-white/60 hover:bg-white transition text-center">
            <Calendar className="h-4 w-4 mx-auto mb-1"/>
            <span className="text-xs">Attendance</span>
            </Link>
          </div>

        {/* Auth Card */}
        <Card className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl">
            <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full" onValueChange={v => setTab(v as 'signin' | 'signup' | 'admin')}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
                <TabsTrigger value="admin" className="text-sm">Admin</TabsTrigger>
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
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        className="h-11"
                          />
                      </div>
                      <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        className="h-11"
                          />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                        <select
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          required
                      className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {roles.map((roleOption) => (
                            <option key={roleOption.value} value={roleOption.value}>
                              {roleOption.label}
                            </option>
                          ))}
                        </select>
                    </div>

                  {/* Course and Branch Selection */}
                    {(role === 'student' || role === 'faculty' || role === 'hod') && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="course">Course</Label>
                            <select
                              id="course"
                              value={course}
                              onChange={(e) => setCourse(e.target.value)}
                              required
                          className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Course</option>
                              {courses.map((courseOption) => (
                                <option key={courseOption.value} value={courseOption.value}>
                                  {courseOption.label}
                                </option>
                              ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                            <select
                              id="branch"
                              value={branch}
                              onChange={(e) => setBranch(e.target.value)}
                              required
                          className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Branch</option>
                              {branches.map((branchOption) => (
                                <option key={branchOption.value} value={branchOption.value}>
                                  {branchOption.label}
                                </option>
                              ))}
                            </select>
                      </div>
                    </div>
                  )}

                  {/* Email and Password */}
                    <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                      className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                      className="h-11"
                        />
                      </div>

                  <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
                
              {/* Admin Form */}
              <TabsContent value="admin" className="space-y-4">
                  {/* Admin Login Mode Toggle */}
                <div className="flex justify-center space-x-2">
                    <button
                      type="button"
                      onClick={switchToAdminPassword}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        adminStep === 'login'
                        ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={switchToAdminOTP}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        adminStep === 'otp'
                        ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      OTP
                    </button>
                  </div>

                  {adminStep === 'login' ? (
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                          <Input
                            id="admin-email"
                            type="email"
                            placeholder="admin@erp.com"
                            value={adminEmail}
                            onChange={e => setAdminEmail(e.target.value)}
                            required
                        className="h-11"
                          />
                        </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                          <Input
                            id="admin-password"
                            type="password"
                            placeholder="Enter admin password"
                            value={adminPassword}
                            onChange={e => setAdminPassword(e.target.value)}
                            required
                        className="h-11"
                          />
                        </div>
                    <Button type="submit" className="w-full h-11 bg-red-600 hover:bg-red-700" disabled={adminLoading}>
                        {adminLoading ? 'Verifying...' : 'Admin Login'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email-otp">Admin Email</Label>
                          <Input
                            id="admin-email-otp"
                            type="email"
                            placeholder="admin@erp.com"
                            value={adminEmail}
                            onChange={e => setAdminEmail(e.target.value)}
                            required
                        className="h-11"
                          />
                      </div>
                      
                      {!adminOtpSent ? (
                        <Button
                          type="button"
                          onClick={handleSendAdminOTP}
                          disabled={adminLoading || !adminEmail}
                        className="w-full h-11 bg-red-500 hover:bg-red-600"
                        >
                          {adminLoading ? 'Sending OTP...' : 'Send Admin OTP'}
                        </Button>
                      ) : (
                        <>
                        <div className="space-y-2">
                          <Label htmlFor="admin-otp">OTP Code</Label>
                              <Input
                                id="admin-otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={adminOtp}
                                onChange={e => setAdminOtp(e.target.value)}
                                required
                                maxLength={6}
                            className="h-11"
                              />
                            </div>
                        <div className="flex items-center space-x-2">
                            <input
                              id="admin-trust"
                              type="checkbox"
                              checked={adminTrust}
                              onChange={e => setAdminTrust(e.target.checked)}
                            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                          <Label htmlFor="admin-trust" className="text-sm text-gray-700">Trust this device for 30 days</Label>
                          </div>
                        <Button type="submit" className="w-full h-11 bg-red-600 hover:bg-red-700" disabled={adminLoading}>
                            {adminLoading ? 'Verifying OTP...' : 'Verify Admin OTP'}
                          </Button>
                        <div className="flex justify-between">
                            <button
                              type="button"
                              onClick={resetAdminOTPLogin}
                            className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              ← Back to Send OTP
                            </button>
                            <button
                              type="button"
                              onClick={handleSendAdminOTP}
                              disabled={adminLoading}
                            className="text-sm text-red-600 hover:text-red-800"
                            >
                              Resend OTP
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  )}
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