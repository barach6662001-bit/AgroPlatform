import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WarehousesList from '../WarehousesList';
import type { WarehouseDto } from '../../../types/warehouse';
import type { PaginatedResult } from '../../../types/common';

/* ── Mocks ─────────────────────────────────────────────────────────── */

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const getWarehousesMock = vi.fn();
vi.mock('../../../api/warehouses', () => ({
  getWarehouses: (...args: unknown[]) => getWarehousesMock(...args),
  createWarehouse: vi.fn(),
}));

vi.mock('../../../hooks/useRole', () => ({
  useRole: () => ({ hasPermission: () => false }),
}));

vi.mock('../../../i18n', () => ({
  useTranslation: () => ({
    t: {
      common: { create: 'Створити', cancel: 'Скасувати', required: "Обов'язково" },
      nav: { storageLogistics: 'Склад і логістика', warehouses: 'Склади' },
      warehouses: {
        title: 'Склади',
        subtitle: 'Перелік складів',
        name: 'Назва',
        location: 'Розташування',
        type: 'Тип',
        status: 'Статус',
        actions: 'Дії',
        balances: 'Залишки',
        active: 'Активний',
        inactive: 'Неактивний',
        typeGeneral: 'Загальний',
        typeGrain: 'Зерновий',
        createWarehouse: 'Створити склад',
        createSuccess: 'Створено',
        createError: 'Помилка',
        loadError: 'Помилка завантаження',
      },
    },
    lang: 'uk',
    setLang: vi.fn(),
  }),
}));

/* ── Helpers ───────────────────────────────────────────────────────── */

const makeWh = (overrides: Partial<WarehouseDto> = {}): WarehouseDto =>
  ({
    id: 'wh-1',
    name: 'Південний склад',
    location: 'Одеса',
    type: 0,
    isActive: true,
    ...overrides,
  } as WarehouseDto);

const makePage = (items: WarehouseDto[]): PaginatedResult<WarehouseDto> =>
  ({
    items,
    totalCount: items.length,
    page: 1,
    pageSize: 15,
  } as PaginatedResult<WarehouseDto>);

const renderList = () =>
  render(
    <MemoryRouter>
      <WarehousesList />
    </MemoryRouter>,
  );

beforeEach(() => {
  navigateMock.mockReset();
  getWarehousesMock.mockReset();
});

const findRowByName = async (name: string) => {
  // AntD renders the <tbody> inside .ant-table-tbody. Each clickable
  // row carries the .clickable-row class plus role="button" applied
  // by Phase 2g. We locate the row by its accessible name.
  return await screen.findByRole('button', { name: new RegExp(name) });
};

/* ── Render ────────────────────────────────────────────────────────── */

describe('WarehousesList — render', () => {
  it('renders one clickable row per warehouse', async () => {
    getWarehousesMock.mockResolvedValue(
      makePage([
        makeWh(),
        makeWh({ id: 'wh-2', name: 'Західний склад', location: 'Львів', type: 1, isActive: false }),
      ]),
    );
    renderList();
    expect(await findRowByName('Південний склад')).toBeInTheDocument();
    expect(await findRowByName('Західний склад')).toBeInTheDocument();
  });

  it('does not render a clickable button row when the list is empty', async () => {
    getWarehousesMock.mockResolvedValue(makePage([]));
    renderList();
    await waitFor(() => expect(getWarehousesMock).toHaveBeenCalled());
    // No data rows → no <tr role="button"> entries. AntD still
    // renders pagination arrow buttons; we narrow to "warehouse-row"
    // buttons by accessible name.
    expect(screen.queryByRole('button', { name: /склад/i })).not.toBeInTheDocument();
  });
});

/* ── Accessibility (Phase 2g) ─────────────────────────────────────── */

describe('WarehousesList — accessibility', () => {
  it('exposes each row as a button with a row-summary accessible name', async () => {
    getWarehousesMock.mockResolvedValue(
      makePage([
        makeWh({ name: 'Південний склад', location: 'Одеса', type: 0, isActive: true }),
      ]),
    );
    renderList();
    const row = await findRowByName('Південний склад');
    expect(row.getAttribute('aria-label')).toBe('Південний склад, Одеса, Загальний, Активний');
  });

  it('uses an em-dash placeholder when the warehouse has no location', async () => {
    getWarehousesMock.mockResolvedValue(
      makePage([makeWh({ location: '' })]),
    );
    renderList();
    const row = await findRowByName('Південний склад');
    expect(row.getAttribute('aria-label')).toBe('Південний склад, —, Загальний, Активний');
  });

  it('reflects grain warehouse type in the accessible name', async () => {
    getWarehousesMock.mockResolvedValue(
      makePage([makeWh({ type: 1 })]),
    );
    renderList();
    const row = await findRowByName('Південний склад');
    expect(row.getAttribute('aria-label')).toContain('Зерновий');
  });

  it('reflects inactive status in the accessible name', async () => {
    getWarehousesMock.mockResolvedValue(
      makePage([makeWh({ isActive: false })]),
    );
    renderList();
    const row = await findRowByName('Південний склад');
    expect(row.getAttribute('aria-label')).toContain('Неактивний');
  });

  it('makes each row keyboard-reachable (tabIndex=0)', async () => {
    getWarehousesMock.mockResolvedValue(makePage([makeWh()]));
    renderList();
    const row = await findRowByName('Південний склад');
    expect(row).toHaveAttribute('tabindex', '0');
  });

  it('keeps the .clickable-row class so the focus-visible ring + cursor styling apply', async () => {
    getWarehousesMock.mockResolvedValue(makePage([makeWh()]));
    renderList();
    const row = await findRowByName('Південний склад');
    expect(row.className).toContain('clickable-row');
  });
});

/* ── Activation ────────────────────────────────────────────────────── */

describe('WarehousesList — activation', () => {
  it('navigates to the warehouse balances page when a row is clicked', async () => {
    getWarehousesMock.mockResolvedValue(makePage([makeWh({ id: 'wh-42' })]));
    renderList();
    const row = await findRowByName('Південний склад');
    fireEvent.click(row);
    expect(navigateMock).toHaveBeenCalledWith('/warehouses/items?warehouse=wh-42');
  });

  it('navigates when Enter is pressed while a row has focus', async () => {
    getWarehousesMock.mockResolvedValue(makePage([makeWh({ id: 'wh-42' })]));
    renderList();
    const row = await findRowByName('Південний склад');
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(navigateMock).toHaveBeenCalledWith('/warehouses/items?warehouse=wh-42');
  });

  it('navigates when Space is pressed while a row has focus', async () => {
    getWarehousesMock.mockResolvedValue(makePage([makeWh({ id: 'wh-42' })]));
    renderList();
    const row = await findRowByName('Південний склад');
    fireEvent.keyDown(row, { key: ' ' });
    expect(navigateMock).toHaveBeenCalledWith('/warehouses/items?warehouse=wh-42');
  });

  it('Space activation calls preventDefault to suppress page scroll', async () => {
    getWarehousesMock.mockResolvedValue(makePage([makeWh({ id: 'wh-42' })]));
    renderList();
    const row = await findRowByName('Південний склад');
    const evt = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    row.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith('/warehouses/items?warehouse=wh-42');
  });

  it('does not navigate on unrelated keys (Tab, Escape, Shift, ArrowDown)', async () => {
    getWarehousesMock.mockResolvedValue(makePage([makeWh()]));
    renderList();
    const row = await findRowByName('Південний склад');
    fireEvent.keyDown(row, { key: 'Tab' });
    fireEvent.keyDown(row, { key: 'Escape' });
    fireEvent.keyDown(row, { key: 'Shift' });
    fireEvent.keyDown(row, { key: 'ArrowDown' });
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('routes each row to its own warehouse id', async () => {
    getWarehousesMock.mockResolvedValue(
      makePage([
        makeWh({ id: 'wh-A', name: 'Склад А' }),
        makeWh({ id: 'wh-B', name: 'Склад Б' }),
      ]),
    );
    renderList();
    fireEvent.click(await findRowByName('Склад А'));
    fireEvent.click(await findRowByName('Склад Б'));
    expect(navigateMock).toHaveBeenNthCalledWith(1, '/warehouses/items?warehouse=wh-A');
    expect(navigateMock).toHaveBeenNthCalledWith(2, '/warehouses/items?warehouse=wh-B');
  });
});

