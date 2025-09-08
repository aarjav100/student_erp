import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'student' | 'teacher' | 'faculty' | 'professor' | 'assistant-professor' | 'associate-professor' | 'admin' | 'staff' | 'librarian' | 'accountant' | 'hr' | 'registrar' | 'dean' | 'principal' | 'vice-principal' | 'coordinator' | 'counselor' | 'security' | 'maintenance' | 'guest' | 'warden' | 'rector';
  status: 'pending' | 'approved' | 'rejected';
  studentId?: string;
  phone?: string;
  course?: string;
  branch?: string;
  program?: string;
  yearLevel?: number;
  // Optional profile fields used across the app
  profileImage?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  bio?: string;
  passwordChangedAt?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string, testId?: string, role?: string, course?: string) => Promise<{ error: string | null; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  adminSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  adminOTP: (email: string, otp: string) => Promise<{ error: string | null; data?: User }>;
  sendOTP: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data;
        // Convert backend user format to frontend format
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          firstName: userData.name.split(' ')[0],
          lastName: userData.name.split(' ').slice(1).join(' '),
          role: userData.role,
          status: userData.status,
          createdAt: userData.createdAt
        });
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string, testId?: string, role?: string, course?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          testId,
          role,
          course,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "Account created successfully! Awaiting approval.",
        });
        return { error: null, message: data.message };
      } else {
        return { error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Network error during registration' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        const userData = data.data.user;
        // Convert backend user format to frontend format
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          firstName: userData.name.split(' ')[0],
          lastName: userData.name.split(' ').slice(1).join(' '),
          role: userData.role,
          status: userData.status,
          createdAt: userData.createdAt
        });
        toast({
          title: "Success",
          description: "Welcome back!",
        });
        navigate('/');
        return { error: null };
      } else {
        return { error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Network error during login' };
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setUser(null);
      setToken(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/auth');
    }
  };

  const adminSignIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data.user.role === 'admin') {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        toast({
          title: "Success",
          description: "Admin login successful!",
        });
        navigate('/');
        return { error: null };
      } else {
        return { error: 'Invalid admin credentials' };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { error: 'Network error during admin login' };
    }
  };

  const sendOTP = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { error: null };
      } else {
        return { error: data.error || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      return { error: 'Network error sending OTP' };
    }
  };

  const adminOTP = async (email: string, otp: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        toast({
          title: "Success",
          description: "Admin login successful!",
        });
        navigate('/');
        return { error: null, data: data.data };
      } else {
        return { error: data.error || 'OTP verification failed' };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return { error: 'Network error during OTP verification' };
    }
  };

  const value = {
    user,
    token,
    loading,
    signUp,
    signIn,
    signOut,
    adminSignIn,
    adminOTP,
    sendOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};