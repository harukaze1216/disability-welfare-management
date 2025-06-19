import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'HQ' | 'FC';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, userData, loading } = useAuth();

  console.log('ProtectedRoute Debug:', { user, userData, loading, requiredRole });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!userData) {
    console.log('No userData, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userData.role !== requiredRole) {
    console.log('Role mismatch:', userData.role, 'required:', requiredRole);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};