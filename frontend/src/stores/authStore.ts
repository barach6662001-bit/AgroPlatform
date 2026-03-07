import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, email: string, role: string, tenantId: string) => void;
  setTenantId: (tenantId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: null,
      tenantId: null,
      isAuthenticated: false,
      setAuth: (token, email, role, tenantId) =>
        set({ token, email, role, tenantId, isAuthenticated: true }),
      setTenantId: (tenantId) => set({ tenantId }),
      logout: () =>
        set({ token: null, email: null, role: null, tenantId: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
