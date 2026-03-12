import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  Tooltip: () => <div />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Legend: () => <div />,
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
  it('renders dashboard without crashing', () => {
    const { container } = renderDashboard();
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    renderDashboard();
    // Dashboard shows Spin while loading, then hides it
    // The component starts with loading=true and renders <Spin>
    const spinEl = document.querySelector('.ant-spin');
    expect(spinEl).toBeTruthy();
  });
});
