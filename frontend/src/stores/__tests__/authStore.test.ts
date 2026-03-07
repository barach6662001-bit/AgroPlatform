import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

beforeEach(() => {
  useAuthStore.setState({
    token: null,
    email: null,
    role: null,
    tenantId: null,
    isAuthenticated: false,
  });
});

describe('authStore', () => {
  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.email).toBeNull();
    expect(state.role).toBeNull();
    expect(state.tenantId).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setAuth updates state and sets isAuthenticated to true', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth('tok123', 'user@example.com', 'Admin', 'tenant-1');

    const state = useAuthStore.getState();
    expect(state.token).toBe('tok123');
    expect(state.email).toBe('user@example.com');
    expect(state.role).toBe('Admin');
    expect(state.tenantId).toBe('tenant-1');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setTenantId updates tenantId without changing other fields', () => {
    useAuthStore.setState({ token: 'tok', email: 'a@b.com', role: 'User', tenantId: 'old', isAuthenticated: true });
    const { setTenantId } = useAuthStore.getState();
    setTenantId('new-tenant');

    const state = useAuthStore.getState();
    expect(state.tenantId).toBe('new-tenant');
    expect(state.token).toBe('tok');
    expect(state.isAuthenticated).toBe(true);
  });

  it('logout resets all auth fields', () => {
    useAuthStore.setState({ token: 'tok', email: 'a@b.com', role: 'Admin', tenantId: 't1', isAuthenticated: true });
    const { logout } = useAuthStore.getState();
    logout();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.email).toBeNull();
    expect(state.role).toBeNull();
    expect(state.tenantId).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('persist config uses key auth-storage', () => {
    // Verify the store is backed by persist with the correct storage key
    // @ts-expect-error accessing internal persist api
    expect(useAuthStore.persist.getOptions().name).toBe('auth-storage');
  });
});
