import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // Roles that are allowed to access this route
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user has permission
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some((role) => {
      // Check if user's role matches or starts with the allowed role
      return user.role === role || user.role.startsWith(role);
    });

    // If user doesn't have permission, show 403 page
    if (!hasPermission) {
      return <Navigate to="/403" replace />;
    }
  }

  // User is authenticated and has permission
  return <>{children}</>;
}
