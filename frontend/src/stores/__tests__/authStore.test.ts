import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      email: null,
      role: null,
      tenantId: null,
      requirePasswordChange: false,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
    });
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.email).toBeNull();
    expect(state.role).toBeNull();
    expect(state.tenantId).toBeNull();
    expect(state.requirePasswordChange).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  it('setAuth sets all fields and marks authenticated', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth('tok123', 'user@example.com', 'CompanyAdmin', 'tenant-1', false, true, 'John', 'Doe', 'refresh-abc');
    const state = useAuthStore.getState();
    expect(state.token).toBe('tok123');
    expect(state.refreshToken).toBe('refresh-abc');
    expect(state.email).toBe('user@example.com');
    expect(state.role).toBe('CompanyAdmin');
    expect(state.tenantId).toBe('tenant-1');
    expect(state.requirePasswordChange).toBe(false);
    expect(state.firstName).toBe('John');
    expect(state.lastName).toBe('Doe');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setTenantId updates only tenantId', () => {
    useAuthStore.setState({ token: 'tok', email: 'a@b.com', role: 'CompanyAdmin', tenantId: 'old', isAuthenticated: true });
    const { setTenantId } = useAuthStore.getState();
    setTenantId('new-tenant');
    const state = useAuthStore.getState();
    expect(state.tenantId).toBe('new-tenant');
    expect(state.token).toBe('tok');
    expect(state.isAuthenticated).toBe(true);
  });

  it('logout resets state to unauthenticated', () => {
    useAuthStore.setState({ token: 'tok', refreshToken: 'rt', email: 'a@b.com', role: 'CompanyAdmin', tenantId: 't1', isAuthenticated: true });
    const { logout } = useAuthStore.getState();
    logout();
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.email).toBeNull();
    expect(state.role).toBeNull();
    expect(state.tenantId).toBeNull();
    expect(state.requirePasswordChange).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });
});
