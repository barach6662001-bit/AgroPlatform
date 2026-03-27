import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  tenantId: string | null;
  firstName: string | null;
  lastName: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, email: string, role: string, tenantId: string, firstName?: string, lastName?: string) => void;
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
      firstName: null,
      lastName: null,
      isAuthenticated: false,
      setAuth: (token, email, role, tenantId, firstName, lastName) =>
        set({ token, email, role, tenantId, firstName: firstName ?? null, lastName: lastName ?? null, isAuthenticated: true }),
      setTenantId: (tenantId) => set({ tenantId }),
      logout: () =>
        set({ token: null, email: null, role: null, tenantId: null, firstName: null, lastName: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
