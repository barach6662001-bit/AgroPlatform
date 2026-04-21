import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePermissionsStore } from './permissionsStore';
import { isBypassEnabled } from '../mocks/isBypassEnabled';
import { mockUser } from '../mocks/mockUser';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
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
    lastName?: string,
    refreshToken?: string
  ) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setTenantId: (tenantId: string) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      email: null,
      role: null,
      tenantId: null,
      requirePasswordChange: false,
      hasCompletedOnboarding: false,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
      setAuth: (token, email, role, tenantId, requirePasswordChange, hasCompletedOnboarding, firstName, lastName, refreshToken) =>
        set({
          token,
          refreshToken: refreshToken ?? null,
          email,
          role,
          tenantId,
          requirePasswordChange,
          hasCompletedOnboarding: hasCompletedOnboarding ?? false,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          isAuthenticated: true,
        }),
      setTokens: (token, refreshToken) =>
        set({ token, refreshToken }),
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
          refreshToken: null,
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

// Dev-only auth bypass: seed the store with a mock authenticated user so Replit
// sandbox (and similar local-only preview environments) can render protected
// pages without a backend. Runs exactly once, only when `isBypassEnabled` is true
// (which requires BOTH `import.meta.env.DEV` and `VITE_BYPASS_AUTH=true`), and
// never overwrites a real logged-in session rehydrated from localStorage.
if (isBypassEnabled && !useAuthStore.getState().isAuthenticated) {
  useAuthStore.getState().setAuth(
    mockUser.token,
    mockUser.email,
    mockUser.role,
    mockUser.tenantId,
    mockUser.requirePasswordChange,
    mockUser.hasCompletedOnboarding,
    mockUser.firstName,
    mockUser.lastName,
    mockUser.refreshToken
  );
}
