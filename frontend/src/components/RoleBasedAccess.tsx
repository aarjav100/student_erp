import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  allowedRoles: ('student' | 'teacher' | 'admin')[];
  fallback?: React.ReactNode;
  showAlert?: boolean;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  allowedRoles,
  fallback = null,
  showAlert = true
}) => {
  const { user } = useAuth();

  if (!user) {
    return showAlert ? (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Please log in to access this feature.
        </AlertDescription>
      </Alert>
    ) : fallback;
  }

  if (!allowedRoles.includes(user.role)) {
    return showAlert ? (
      <Alert className="border-orange-200 bg-orange-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Access denied. This feature is only available to {allowedRoles.join(', ')} users.
          {user.role === 'student' && ' Please contact an administrator for assistance.'}
        </AlertDescription>
      </Alert>
    ) : fallback;
  }

  return <>{children}</>;
};

// Convenience components for common role restrictions
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode; showAlert?: boolean }> = ({
  children,
  fallback,
  showAlert
}) => (
  <RoleBasedAccess allowedRoles={['admin']} fallback={fallback} showAlert={showAlert}>
    {children}
  </RoleBasedAccess>
);

export const TeacherAndAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode; showAlert?: boolean }> = ({
  children,
  fallback,
  showAlert
}) => (
  <RoleBasedAccess allowedRoles={['teacher', 'admin']} fallback={fallback} showAlert={showAlert}>
    {children}
  </RoleBasedAccess>
);

export const StudentOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode; showAlert?: boolean }> = ({
  children,
  fallback,
  showAlert
}) => (
  <RoleBasedAccess allowedRoles={['student']} fallback={fallback} showAlert={showAlert}>
    {children}
  </RoleBasedAccess>
);
