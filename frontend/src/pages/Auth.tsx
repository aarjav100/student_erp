import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Eye, EyeOff, Lock, Mail, User, Phone, Hash, Shield } from 'lucide-react';
import { useEffect } from 'react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    const { error } = await signIn(email, password);

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
    setLoading(true);

    const { error } = await signUp(email, password, firstName, lastName, studentId || undefined, phone || undefined);

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
    
    const { error } = await adminSignIn(adminEmail, adminPassword);
    
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    }
    
    setAdminLoading(false);
  };

  const handleAdminOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    
    const { error } = await adminOTP(adminEmail, adminOtp);
    
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      if (adminTrust) {
        document.cookie = `trusted_admin_device=1; max-age=${30 * 24 * 60 * 60}; path=/; secure; samesite=strict`;
      }
    }
    
    setAdminLoading(false);
  };

  const handleSendOTP = async () => {
    if (!adminEmail) {
      toast({ title: 'Error', description: 'Please enter admin email first', variant: 'destructive' });
      return;
    }

    setAdminLoading(true);
    const { error } = await sendOTP(adminEmail);
    
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      setAdminStep('otp');
      toast({ title: 'OTP Sent', description: 'Check your email for the code.' });
    }
    
    setAdminLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Golden Banner */}
      <div className="w-full h-24 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-b-3xl"></div>
      
      {/* Green Welcome Banner */}
      <div className="w-full h-32 bg-gradient-to-r from-teal-600 to-teal-700 rounded-b-3xl relative">
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div className="text-white">
            <h1 className="text-4xl font-bold">Welcome Back</h1>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
            onClick={() => setTab('signin')}
          >
            Login
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-2xl">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 mb-2">EduConnect</h2>
            <p className="text-gray-400">Your All-in-One Student ERP Solution</p>
          </div>

          {/* Auth Forms */}
          <Card className="bg-gray-800 border-gray-700 shadow-2xl">
            <CardContent className="p-6">
              <Tabs defaultValue={tab} className="w-full" onValueChange={v => setTab(v as 'signin' | 'signup' | 'admin')}>
                <TabsList className="grid w-full grid-cols-3 bg-gray-700 border-gray-600">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign Up</TabsTrigger>
                  <TabsTrigger value="admin" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Admin</TabsTrigger>
                </TabsList>
                
                {/* User Sign In */}
                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-slate-100 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-400" />
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-slate-100 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-purple-400" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <button type="button" className="text-sm text-purple-400 hover:text-purple-300">
                        Forgot Password?
                      </button>
                    </div>
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    
                    {/* Social Login */}
                    <div className="space-y-3 mt-6">
                      <Button type="button" variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                        Continue with Google
                      </Button>
                      <Button type="button" variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                        Continue with Microsoft
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                {/* User Sign Up */}
                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-100 flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-400" />
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-100 flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-400" />
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-slate-100 flex items-center gap-2">
                        <Hash className="h-4 w-4 text-purple-400" />
                        Student ID (Optional)
                      </Label>
                      <Input
                        id="studentId"
                        placeholder="Student ID"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-100 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-purple-400" />
                        Phone (Optional)
                      </Label>
                      <Input
                        id="phone"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-100 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-400" />
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-100 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-purple-400" />
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* Admin Login/OTP */}
                <TabsContent value="admin" className="mt-6">
                  {adminStep === 'login' ? (
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email" className="text-slate-100 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-purple-400" />
                          Admin Email
                        </Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@erp.com"
                          value={adminEmail}
                          onChange={e => setAdminEmail(e.target.value)}
                          required
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password" className="text-slate-100 flex items-center gap-2">
                          <Lock className="h-4 w-4 text-purple-400" />
                          Password
                        </Label>
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Enter admin password"
                          value={adminPassword}
                          onChange={e => setAdminPassword(e.target.value)}
                          required
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={adminLoading}>
                        {adminLoading ? 'Verifying...' : 'Admin Login'}
                      </Button>
                      <div className="text-center">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleSendOTP}
                          disabled={adminLoading || !adminEmail}
                          className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                        >
                          Send OTP Instead
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleAdminOtp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-otp" className="text-slate-100 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-400" />
                          Enter OTP
                        </Label>
                        <Input
                          id="admin-otp"
                          type="text"
                          placeholder="6-digit code"
                          value={adminOtp}
                          onChange={e => setAdminOtp(e.target.value)}
                          required
                          maxLength={6}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="admin-trust"
                          type="checkbox"
                          checked={adminTrust}
                          onChange={e => setAdminTrust(e.target.checked)}
                          className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                        />
                        <Label htmlFor="admin-trust" className="text-white">Trust this device for 30 days</Label>
                      </div>
                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={adminLoading}>
                        {adminLoading ? 'Verifying OTP...' : 'Verify OTP'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setAdminStep('login')}
                        className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        Back to Login
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => setTab('signup')}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;