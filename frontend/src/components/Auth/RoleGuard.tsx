import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import type { AppRole, AppModule, AppAction } from '../../hooks/useRole';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles?: AppRole[];
  module?: AppModule;
  action?: AppAction;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guards a section of the UI by role or by module permission.
 *
 * Usage — role-based (legacy):
 *   <RoleGuard allowedRoles={['Administrator', 'Admin']}>...</RoleGuard>
 *
 * Usage — permission-based:
 *   <RoleGuard module="fields" action="manage">...</RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  module,
  action,
  children,
  fallback,
}) => {
  const { hasRole, hasPermission } = useRole();

  const allowed =
    module && action
      ? hasPermission(module, action)
      : allowedRoles
      ? hasRole(allowedRoles)
      : true;

  if (!allowed) {
    return fallback ? <>{fallback}</> : <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

