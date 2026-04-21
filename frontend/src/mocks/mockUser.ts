import { mockTenantId } from './mockTenant';

/**
 * Arguments to pass into `useAuthStore.getState().setAuth(...)` when bypass is on.
 * Shape matches the `setAuth` signature in [authStore.ts](../stores/authStore.ts).
 *
 * A fake JWT-looking token is provided so axios does not blow up, but it is never
 * validated because the bypass axios interceptor short-circuits all `/api/*` calls.
 */
export const mockUser = {
  token: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  email: 'demo@agroplatform.dev',
  role: 'CompanyAdmin',
  tenantId: mockTenantId,
  requirePasswordChange: false,
  hasCompletedOnboarding: true,
  firstName: 'Демо',
  lastName: 'Користувач',
} as const;
