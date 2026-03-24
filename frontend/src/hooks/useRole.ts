import { useAuthStore } from '../stores/authStore';
import { checkPermission } from '../utils/permissionMatrix';
import type { AppModule, AppAction } from '../utils/permissionMatrix';

export type AppRole =
  | 'Administrator'
  | 'Manager'
  | 'Agronomist'
  | 'Storekeeper'
  | 'Director'
  | 'Admin'
  | 'Operator'
  | 'Viewer';

export const useRole = () => {
  const role = useAuthStore((s) => s.role) as AppRole | null;

  const hasRole = (allowedRoles: AppRole[]) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const hasPermission = (module: AppModule, action: AppAction) =>
    checkPermission(role, module, action);

  const isAdmin = role === 'Administrator' || role === 'Admin';
  const isManager = role === 'Manager';
  const isAgronomist = role === 'Agronomist';
  const isStorekeeper = role === 'Storekeeper';
  const isDirector = role === 'Director';
  const isOperator = role === 'Operator';
  const isViewer = role === 'Viewer';

  return {
    role,
    hasRole,
    hasPermission,
    isAdmin,
    isManager,
    isAgronomist,
    isStorekeeper,
    isDirector,
    isOperator,
    isViewer,
  };
};

export type { AppModule, AppAction };

