import type { AppRole } from '../hooks/useRole';

export type AppModule = 'warehouses' | 'inventory' | 'analytics' | 'machinery' | 'fields' | 'grain-storage';
export type AppAction = 'view' | 'manage';

const ALL_ROLES: AppRole[] = [
  'SuperAdmin', 'CompanyAdmin', 'Manager', 'WarehouseOperator', 'Accountant', 'Viewer',
  // Legacy
  'Administrator', 'Agronomist', 'Storekeeper', 'Director', 'Admin', 'Operator',
];

const permissionMatrix: Record<AppModule, Record<AppAction, AppRole[]>> = {
  warehouses: {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager', 'WarehouseOperator', 'Administrator', 'Admin', 'Storekeeper', 'Operator'],
  },
  inventory: {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager', 'WarehouseOperator', 'Administrator', 'Admin', 'Storekeeper', 'Operator'],
  },
  analytics: {
    view:   ALL_ROLES,
    manage: [],
  },
  machinery: {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager', 'Administrator', 'Admin'],
  },
  fields: {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager', 'Administrator', 'Admin', 'Agronomist', 'Operator'],
  },
  'grain-storage': {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager', 'WarehouseOperator', 'Administrator', 'Admin', 'Storekeeper'],
  },
};

export function checkPermission(role: AppRole | null, module: AppModule, action: AppAction): boolean {
  if (!role) return false;
  return permissionMatrix[module][action].includes(role);
}
