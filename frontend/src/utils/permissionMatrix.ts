import type { AppRole } from '../hooks/useRole';

export type AppModule = 'warehouses' | 'inventory' | 'analytics' | 'machinery' | 'fields' | 'grain-storage';
export type AppAction = 'view' | 'manage';

const ALL_ROLES: AppRole[] = [
  'SuperAdmin', 'CompanyAdmin', 'Manager', 'WarehouseOperator', 'Accountant', 'Viewer',
];

const permissionMatrix: Record<AppModule, Record<AppAction, AppRole[]>> = {
  warehouses: {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager', 'WarehouseOperator'],
  },
  inventory: {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager', 'WarehouseOperator'],
  },
  analytics: {
    view:   ALL_ROLES,
    manage: [],
  },
  machinery: {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager'],
  },
  fields: {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager'],
  },
  'grain-storage': {
    view:   ALL_ROLES,
    manage: ['SuperAdmin', 'CompanyAdmin', 'Manager', 'WarehouseOperator'],
  },
};

export function checkPermission(role: AppRole | null, module: AppModule, action: AppAction): boolean {
  if (!role) return false;
  return permissionMatrix[module][action].includes(role);
}
