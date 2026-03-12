import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BudgetPage from '../Economics/BudgetPage';

vi.mock('../../api/budgets', () => ({
  getBudgets: vi.fn(() => Promise.resolve([])),
  upsertBudget: vi.fn(),
}));

vi.mock('../../api/economics', () => ({
  getCostSummary: vi.fn(() =>
    Promise.resolve({ byCategory: [], totalAmount: 0, currency: 'UAH' }),
  ),
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

function renderBudgetPage() {
  return render(
    <MemoryRouter>
      <BudgetPage />
    </MemoryRouter>,
  );
}

describe('BudgetPage', () => {
  it('renders budget page', () => {
    const { container } = renderBudgetPage();
    expect(container).toBeTruthy();
  });

  it('shows budget table with data', () => {
    renderBudgetPage();
    expect(document.querySelector('.ant-table')).toBeTruthy();
  });
});
