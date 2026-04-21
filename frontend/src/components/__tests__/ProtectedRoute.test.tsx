import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import ProtectedRoute from '../ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      email: null,
      role: null,
      tenantId: null,
      requirePasswordChange: false,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
    });
  });

  it('redirects to /login when user is not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    useAuthStore.setState({
      token: 'tok',
      email: 'a@b.com',
      role: 'CompanyAdmin',
      tenantId: 't1',
      requirePasswordChange: false,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/change-password" element={<div>Change Password</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redirects to /change-password when requirePasswordChange is true', () => {
    useAuthStore.setState({
      token: 'tok',
      email: 'a@b.com',
      role: 'CompanyAdmin',
      tenantId: 't1',
      requirePasswordChange: true,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/change-password" element={<div>Change Password Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Change Password Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });
});
