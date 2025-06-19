import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../types';

interface ProtectedRouteProps {
  user: User | null;
  allowedType?: 'doctor' | 'patient';
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedType, children }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedType && user.userType !== allowedType) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
