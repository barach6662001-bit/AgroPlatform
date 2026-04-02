import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { RoleGuard } from '../Auth/RoleGuard';

describe('RoleGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      email: null,
      role: null,
      tenantId: null,
      isAuthenticated: false,
    });
  });

  it('redirects to /access-denied when user role is not allowed', () => {
    useAuthStore.setState({
      token: 'tok',
      email: 'a@b.com',
      role: 'Viewer',
      tenantId: 't1',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/economics']}>
        <Routes>
          <Route
            path="/economics"
            element={
              <RoleGuard allowedRoles={['CompanyAdmin', 'Manager', 'Accountant']}>
                <div>Economics Page</div>
              </RoleGuard>
            }
          />
          <Route path="/access-denied" element={<div>Access Denied Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Access Denied Page')).toBeInTheDocument();
    expect(screen.queryByText('Economics Page')).not.toBeInTheDocument();
  });

  it('renders children when user role is allowed', () => {
    useAuthStore.setState({
      token: 'tok',
      email: 'a@b.com',
      role: 'CompanyAdmin',
      tenantId: 't1',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/economics']}>
        <Routes>
          <Route
            path="/economics"
            element={
              <RoleGuard allowedRoles={['CompanyAdmin', 'Manager', 'Accountant']}>
                <div>Economics Page</div>
              </RoleGuard>
            }
          />
          <Route path="/access-denied" element={<div>Access Denied Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Economics Page')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied Page')).not.toBeInTheDocument();
  });

  it('renders fallback when provided and role is not allowed', () => {
    useAuthStore.setState({
      token: 'tok',
      email: 'a@b.com',
      role: 'Viewer',
      tenantId: 't1',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <RoleGuard
          allowedRoles={['CompanyAdmin', 'Manager']}
          fallback={<div>No Access</div>}
        >
          <div>Protected Content</div>
        </RoleGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText('No Access')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
