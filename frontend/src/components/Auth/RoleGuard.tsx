import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import type { AppRole } from '../../hooks/useRole';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback }) => {
  const { hasRole } = useRole();

  if (!hasRole(allowedRoles)) {
    return fallback ? <>{fallback}</> : <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
