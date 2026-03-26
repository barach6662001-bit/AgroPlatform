import type { AppRole } from '../hooks/useRole';

/**
 * Defines which roles have access to each module action.
 *
 * Permission matrix:
 * ┌──────────────┬───────────────────┬───────────────────┬───────────────┬───────────────────┬───────────────────┬──────────────────────┐
 * │ Role         │ warehouses.manage │ inventory.manage  │ analytics.view│ machinery.manage  │ fields.manage     │ grain-storage.manage │
 * ├──────────────┼───────────────────┼───────────────────┼───────────────┼───────────────────┼───────────────────┼──────────────────────┤
 * │ Admin        │        ✓          │        ✓          │       ✓       │        ✓          │        ✓          │          ✓           │
 * │ Manager      │        ✓          │        ✓          │       ✓       │        ✓          │        ✓          │          ✓           │
 * │ Operator     │        ✓          │        ✓          │       ✓       │        ✗          │        ✓          │          ✗           │
 * │ Viewer       │        ✗          │        ✗          │       ✓       │        ✗          │        ✗          │          ✗           │
 * ├──────────────┼───────────────────┼───────────────────┼───────────────┼───────────────────┼───────────────────┼──────────────────────┤
 * │ Administrator│        ✓          │        ✓          │       ✓       │        ✓          │        ✓          │          ✓           │
 * │ Agronomist   │        ✗          │        ✗          │       ✓       │        ✗          │        ✓          │          ✗           │
 * │ Storekeeper  │        ✓          │        ✓          │       ✓       │        ✗          │        ✗          │          ✓           │
 * │ Director     │        ✗          │        ✗          │       ✓       │        ✗          │        ✗          │          ✗           │
 * └──────────────┴───────────────────┴───────────────────┴───────────────┴───────────────────┴───────────────────┴──────────────────────┘
 */
export type AppModule = 'warehouses' | 'inventory' | 'analytics' | 'machinery' | 'fields' | 'grain-storage';
export type AppAction = 'view' | 'manage';

const permissionMatrix: Record<AppModule, Record<AppAction, AppRole[]>> = {
  warehouses: {
    view:   ['Administrator', 'Manager', 'Agronomist', 'Storekeeper', 'Director', 'Admin', 'Operator', 'Viewer'],
    manage: ['Administrator', 'Manager', 'Storekeeper', 'Admin', 'Operator'],
  },
  inventory: {
    view:   ['Administrator', 'Manager', 'Agronomist', 'Storekeeper', 'Director', 'Admin', 'Operator', 'Viewer'],
    manage: ['Administrator', 'Manager', 'Storekeeper', 'Admin', 'Operator'],
  },
  analytics: {
    view:   ['Administrator', 'Manager', 'Agronomist', 'Storekeeper', 'Director', 'Admin', 'Operator', 'Viewer'],
    manage: [],
  },
  machinery: {
    view:   ['Administrator', 'Manager', 'Agronomist', 'Storekeeper', 'Director', 'Admin', 'Operator', 'Viewer'],
    manage: ['Administrator', 'Manager', 'Admin'],
  },
  fields: {
    view:   ['Administrator', 'Manager', 'Agronomist', 'Storekeeper', 'Director', 'Admin', 'Operator', 'Viewer'],
    manage: ['Administrator', 'Manager', 'Agronomist', 'Admin', 'Operator'],
  },
  'grain-storage': {
    view:   ['Administrator', 'Manager', 'Agronomist', 'Storekeeper', 'Director', 'Admin', 'Operator', 'Viewer'],
    manage: ['Administrator', 'Manager', 'Storekeeper', 'Admin'],
  },
};

export function checkPermission(role: AppRole | null, module: AppModule, action: AppAction): boolean {
  if (!role) return false;
  return permissionMatrix[module][action].includes(role);
}
