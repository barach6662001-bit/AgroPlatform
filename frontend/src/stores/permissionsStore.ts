import { create } from 'zustand';
import { getMyPermissions } from '../api/permissions';

interface PermissionsState {
  permissions: string[];
  role: string;
  loaded: boolean;
  loading: boolean;
  fetchPermissions: () => Promise<void>;
  hasPermission: (policy: string) => boolean;
  reset: () => void;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  permissions: [],
  role: '',
  loaded: false,
  loading: false,

  fetchPermissions: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await getMyPermissions();
      set({ permissions: data.permissions, role: data.role, loaded: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  hasPermission: (policy: string) => {
    const { role, permissions } = get();
    if (role === 'SuperAdmin' || role === 'CompanyAdmin') return true;
    return permissions.includes(policy);
  },

  reset: () => set({ permissions: [], role: '', loaded: false, loading: false }),
}));
