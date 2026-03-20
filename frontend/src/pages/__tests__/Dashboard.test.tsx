import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

vi.mock('../../api/analytics', () => ({
  getDashboard: vi.fn(() =>
    Promise.resolve({
      totalFields: 5,
      totalAreaHectares: 100,
      areaByCrop: {},
      totalWarehouses: 2,
      totalWarehouseItems: 10,
      topStockItems: [],
      totalOperations: 20,
      completedOperations: 15,
      pendingOperations: 5,
      operationsByType: {},
      totalMachines: 3,
      activeMachines: 2,
      underRepairMachines: 1,
      totalHoursWorked: 500,
      totalFuelConsumed: 1000,
      totalCosts: 50000,
      costsByCategory: {},
      costTrend: [],
    }),
  ),
}));

vi.mock('../../api/fields', () => ({
  getFields: vi.fn(() => Promise.resolve({ items: [] })),
}));

vi.mock('../../api/notifications', () => ({
  getNotifications: vi.fn(() => Promise.resolve([])),
}));

vi.mock('recharts', () => ({
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../i18n', () => ({
  useTranslation: () => ({
    t: new Proxy(
      {},
      {
        get: (_: unknown, section: string) =>
          new Proxy(
            {},
            { get: (_2: unknown, key: string) => `${section}.${key}` },
          ),
      },
    ),
    lang: 'en',
    setLang: vi.fn(),
  }),
}));

vi.mock('../../hooks/useRole', () => ({
  useRole: () => ({ isAdmin: true, hasRole: () => true }),
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard page', () => {
  it('renders dashboard without crashing', async () => {
    const { container } = renderDashboard();
    expect(container).toBeTruthy();
    // Wait for async data fetching to complete so no state updates leak
    // after the test environment is torn down.
    await waitFor(() => {
      expect(document.querySelector('.ant-spin')).toBeFalsy();
    });
  });

  it('shows loading state initially', () => {
    renderDashboard();
    // Dashboard starts with loading=true and renders <Spin>
    const spinEl = document.querySelector('.ant-spin');
    expect(spinEl).toBeTruthy();
  });
});
