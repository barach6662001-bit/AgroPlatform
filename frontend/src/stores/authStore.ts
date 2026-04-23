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
  // Super-admin platform flag (PR #610). Independent of `role`; mirrors the server-side AppUser.IsSuperAdmin.
  isSuperAdmin: boolean;
  // Short-lived token issued when login detects a super-admin with MFA enabled.
  // While this is set (and `isAuthenticated` is still false), the SPA routes to /mfa-verify.
  mfaPendingToken: string | null;
  setAuth: (
    token: string,
    email: string,
    role: string,
    tenantId: string,
    requirePasswordChange: boolean,
    hasCompletedOnboarding?: boolean,
    firstName?: string,
    lastName?: string,
    refreshToken?: string,
    isSuperAdmin?: boolean
  ) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setTenantId: (tenantId: string) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  setIsSuperAdmin: (value: boolean) => void;
  setMfaPendingToken: (token: string | null) => void;
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
      isSuperAdmin: false,
      mfaPendingToken: null,
      setAuth: (token, email, role, tenantId, requirePasswordChange, hasCompletedOnboarding, firstName, lastName, refreshToken, isSuperAdmin) =>
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
          isSuperAdmin: isSuperAdmin ?? false,
          mfaPendingToken: null,
        }),
      setTokens: (token, refreshToken) =>
        set({ token, refreshToken }),
      setTenantId: (tenantId) => {
        usePermissionsStore.getState().reset();
        set({ tenantId });
      },
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      setIsSuperAdmin: (value) => set({ isSuperAdmin: value }),
      setMfaPendingToken: (token) => set({ mfaPendingToken: token }),
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
          isSuperAdmin: false,
          mfaPendingToken: null,
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
