import { useAuthStore } from '../stores/authStore';

export type AppRole = 'Administrator' | 'Manager' | 'Agronomist' | 'Storekeeper' | 'Director';

export const useRole = () => {
  const role = useAuthStore((s) => s.role) as AppRole | null;

  const hasRole = (allowedRoles: AppRole[]) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const isAdmin = role === 'Administrator';
  const isManager = role === 'Manager';
  const isAgronomist = role === 'Agronomist';
  const isStorekeeper = role === 'Storekeeper';
  const isDirector = role === 'Director';

  return { role, hasRole, isAdmin, isManager, isAgronomist, isStorekeeper, isDirector };
};
