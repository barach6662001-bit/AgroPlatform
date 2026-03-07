import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../axios';

// Access the internal handlers array of axios InterceptorManager (axios v1.x)
type InterceptorHandler = {
  fulfilled: (config: { headers: Record<string, string> }) => { headers: Record<string, string> };
};

function getRequestInterceptor() {
  const manager = apiClient.interceptors.request as unknown as { handlers: InterceptorHandler[] };
  return manager.handlers[0]?.fulfilled;
}

describe('axios interceptor', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      email: null,
      role: null,
      tenantId: null,
      isAuthenticated: false,
    });
  });

  it('adds Authorization header when token is present', () => {
    useAuthStore.setState({ token: 'test-token', isAuthenticated: true, email: null, role: null, tenantId: null });

    const handler = getRequestInterceptor();
    expect(handler).toBeDefined();

    const config = { headers: {} as Record<string, string> };
    const result = handler!(config);
    expect(result.headers['Authorization']).toBe('Bearer test-token');
  });

  it('adds X-Tenant-Id header when tenantId is present', () => {
    useAuthStore.setState({ token: 'tok', isAuthenticated: true, email: null, role: null, tenantId: 'tenant-99' });

    const handler = getRequestInterceptor();
    const config = { headers: {} as Record<string, string> };
    const result = handler!(config);
    expect(result.headers['X-Tenant-Id']).toBe('tenant-99');
  });

  it('does not add Authorization header when not authenticated', () => {
    const handler = getRequestInterceptor();
    const config = { headers: {} as Record<string, string> };
    const result = handler!(config);
    expect(result.headers['Authorization']).toBeUndefined();
  });

  it('does not add X-Tenant-Id header when tenantId is null', () => {
    useAuthStore.setState({ token: null, isAuthenticated: false, email: null, role: null, tenantId: null });
    const handler = getRequestInterceptor();
    const config = { headers: {} as Record<string, string> };
    const result = handler!(config);
    expect(result.headers['X-Tenant-Id']).toBeUndefined();
  });
});
