import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePermissionsStore } from './permissionsStore';

interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  tenantId: string | null;
  requirePasswordChange: boolean;
  hasCompletedOnboarding: boolean;
  firstName: string | null;
  lastName: string | null;
  isAuthenticated: boolean;
  setAuth: (
    token: string,
    email: string,
    role: string,
    tenantId: string,
    requirePasswordChange: boolean,
    hasCompletedOnboarding?: boolean,
    firstName?: string,
    lastName?: string
  ) => void;
  setTenantId: (tenantId: string) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: null,
      tenantId: null,
      requirePasswordChange: false,
      hasCompletedOnboarding: false,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
      setAuth: (token, email, role, tenantId, requirePasswordChange, hasCompletedOnboarding, firstName, lastName) =>
        set({
          token,
          email,
          role,
          tenantId,
          requirePasswordChange,
          hasCompletedOnboarding: hasCompletedOnboarding ?? false,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          isAuthenticated: true,
        }),
      setTenantId: (tenantId) => {
        usePermissionsStore.getState().reset();
        set({ tenantId });
      },
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      logout: () => {
        usePermissionsStore.getState().reset();
        localStorage.removeItem('auth-storage');
        set({
          token: null,
          email: null,
          role: null,
          tenantId: null,
          requirePasswordChange: false,
          hasCompletedOnboarding: false,
          firstName: null,
          lastName: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
