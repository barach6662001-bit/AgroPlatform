import { useEffect } from 'react';
import { usePermissionsStore } from '../stores/permissionsStore';
import { useAuthStore } from '../stores/authStore';

export const usePermissions = () => {
  const token = useAuthStore((s) => s.token);
  const { loaded, loading, fetchPermissions, hasPermission, permissions, role } =
    usePermissionsStore();

  useEffect(() => {
    if (token && !loaded && !loading) {
      fetchPermissions();
    }
  }, [token, loaded, loading, fetchPermissions]);

  return { permissions, role, loaded, loading, hasPermission };
};
