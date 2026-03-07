import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuthStore } from '../../stores/authStore';

beforeEach(() => {
  useAuthStore.setState({
    token: null,
    email: null,
    role: null,
    tenantId: null,
    isAuthenticated: false,
  });
});

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
