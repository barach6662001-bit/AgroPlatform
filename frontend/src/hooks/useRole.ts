import { useAuthStore } from '../stores/authStore';
import { checkPermission } from '../utils/permissionMatrix';
import type { AppModule, AppAction } from '../utils/permissionMatrix';

export type AppRole =
  | 'SuperAdmin'
  | 'CompanyAdmin'
  | 'Manager'
  | 'WarehouseOperator'
  | 'Accountant'
  | 'Viewer'
  // Legacy — kept for compatibility during migration
  | 'Administrator'
  | 'Agronomist'
  | 'Storekeeper'
  | 'Director'
  | 'Admin'
  | 'Operator';

export const useRole = () => {
  const role = useAuthStore((s) => s.role) as AppRole | null;

  const hasRole = (allowedRoles: AppRole[]) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const hasPermission = (module: AppModule, action: AppAction) =>
    checkPermission(role, module, action);

  const isSuperAdmin = role === 'SuperAdmin';
  const isAdmin = role === 'CompanyAdmin' || role === 'Administrator' || role === 'Admin';
  const isManager = role === 'Manager';
  const isWarehouseOperator = role === 'WarehouseOperator' || role === 'Storekeeper' || role === 'Operator';
  const isAccountant = role === 'Accountant' || role === 'Director';
  const isViewer = role === 'Viewer';

  // Legacy aliases
  const isAgronomist = role === 'Agronomist';
  const isStorekeeper = role === 'Storekeeper';
  const isDirector = role === 'Director';
  const isOperator = role === 'Operator';

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
    // Legacy
    isAgronomist,
    isStorekeeper,
    isDirector,
    isOperator,
  };
};

export type { AppModule, AppAction };
