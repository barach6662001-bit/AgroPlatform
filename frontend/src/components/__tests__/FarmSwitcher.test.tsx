import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FarmSwitcher from '../Layout/FarmSwitcher';
import { useAuthStore } from '../../stores/authStore';
import * as tenantsApi from '../../api/tenants';

vi.mock('../../api/tenants');

const mockGetTenants = vi.mocked(tenantsApi.getTenants);

const TENANT_A = { id: 'tenant-a', name: 'Farm A', isActive: true, createdAtUtc: '2024-01-01T00:00:00Z' };
const TENANT_B = { id: 'tenant-b', name: 'Farm B', isActive: true, createdAtUtc: '2024-01-01T00:00:00Z' };

describe('FarmSwitcher', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 'tok',
      email: 'user@test.com',
      role: 'Manager',
      tenantId: null,
      isAuthenticated: true,
    });
  });

  it('renders nothing when there is only one tenant', async () => {
    mockGetTenants.mockResolvedValue([TENANT_A]);

    const { container } = render(<FarmSwitcher />);
    await waitFor(() => expect(mockGetTenants).toHaveBeenCalled());
    // With a single tenant, component returns null
    expect(container.firstChild).toBeNull();
  });

  it('renders the selector when there are multiple tenants', async () => {
    mockGetTenants.mockResolvedValue([TENANT_A, TENANT_B]);
    useAuthStore.setState({ tenantId: TENANT_A.id });

    render(<FarmSwitcher />);
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
  });

  it('renders nothing when tenant list is empty', async () => {
    mockGetTenants.mockResolvedValue([]);

    const { container } = render(<FarmSwitcher />);
    await waitFor(() => expect(mockGetTenants).toHaveBeenCalled());
    expect(container.firstChild).toBeNull();
  });

  it('auto-selects the first tenant when none is selected', async () => {
    mockGetTenants.mockResolvedValue([TENANT_A, TENANT_B]);

    render(<FarmSwitcher />);
    await waitFor(() => {
      expect(useAuthStore.getState().tenantId).toBe(TENANT_A.id);
    });
  });

  it('does not overwrite an already-valid tenantId', async () => {
    mockGetTenants.mockResolvedValue([TENANT_A, TENANT_B]);
    useAuthStore.setState({ tenantId: TENANT_B.id });

    render(<FarmSwitcher />);
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    expect(useAuthStore.getState().tenantId).toBe(TENANT_B.id);
  });

  it('updates the store tenantId when the user selects a different tenant', async () => {
    mockGetTenants.mockResolvedValue([TENANT_A, TENANT_B]);
    useAuthStore.setState({ tenantId: TENANT_A.id });

    render(<FarmSwitcher />);
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());

    // Open the dropdown
    await act(async () => {
      await userEvent.click(screen.getByRole('combobox'));
    });

    // Select "Farm B"
    const option = await screen.findByText('Farm B');
    await act(async () => {
      await userEvent.click(option);
    });

    expect(useAuthStore.getState().tenantId).toBe(TENANT_B.id);
  });

  it('does not crash the layout when getTenants fails', async () => {
    mockGetTenants.mockRejectedValue(new Error('Network error'));

    const { container } = render(<FarmSwitcher />);
    await waitFor(() => expect(mockGetTenants).toHaveBeenCalled());
    // Component renders null (no tenants loaded) and does not throw
    expect(container.firstChild).toBeNull();
  });
});
