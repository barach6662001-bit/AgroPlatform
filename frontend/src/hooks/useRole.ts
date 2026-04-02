import { useAuthStore } from '../stores/authStore';
import { checkPermission } from '../utils/permissionMatrix';
import type { AppModule, AppAction } from '../utils/permissionMatrix';

export type AppRole =
  | 'SuperAdmin'
  | 'CompanyAdmin'
  | 'Manager'
  | 'WarehouseOperator'
  | 'Accountant'
  | 'Viewer';

export const useRole = () => {
  const role = useAuthStore((s) => s.role) as AppRole | null;

  const hasRole = (allowedRoles: AppRole[]) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const hasPermission = (module: AppModule, action: AppAction) =>
    checkPermission(role, module, action);

  const isSuperAdmin = role === 'SuperAdmin';
  const isAdmin = role === 'CompanyAdmin';
  const isManager = role === 'Manager';
  const isWarehouseOperator = role === 'WarehouseOperator';
  const isAccountant = role === 'Accountant';
  const isViewer = role === 'Viewer';

  return {
    role,
    hasRole,
    hasPermission,
    isSuperAdmin,
    isAdmin,
    isManager,
    isWarehouseOperator,
    isAccountant,
    isViewer,
  };
};

export type { AppModule, AppAction };
