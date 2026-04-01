import { useAuthStore } from '../stores/authStore';

export function useRole() {
  const role = useAuthStore((s) => s.role);

  return {
    role,
    isSuperAdmin: role === 'SuperAdmin',
    isCompanyAdmin: role === 'CompanyAdmin',
    isManager: role === 'Manager',
    canManageWarehouse: ['SuperAdmin', 'CompanyAdmin', 'WarehouseOperator'].includes(role ?? ''),
  };
}
