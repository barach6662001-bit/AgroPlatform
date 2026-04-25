import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommandPalette from '../CommandPalette';

/* ── Mocks ─────────────────────────────────────────────────────────── */

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return { ...actual, useNavigate: () => navigateMock };
});

const globalSearchMock = vi.fn();
vi.mock('../../api/search', () => ({
  globalSearch: (...args: unknown[]) => globalSearchMock(...args),
}));

vi.mock('../../i18n', () => ({
  useTranslation: () => ({
    t: {
      search: {
        placeholder: 'Пошук',
        noResults: 'Немає результатів',
        hint: 'Почніть вводити...',
        typeField: 'Поле',
        typeWarehouse: 'Склад',
        typeMachine: 'Машина',
        typeEmployee: 'Працівник',
        typeGrainStorage: 'Сховище',
        typeFuelTank: 'Бак',
        typeSale: 'Продаж',
      },
    },
    lang: 'uk',
    setLang: vi.fn(),
  }),
}));

/* ── Helpers ───────────────────────────────────────────────────────── */

type Item = { id: string; type: string; title: string; subtitle: string; url: string };

const sampleResults: Item[] = [
  { id: '1', type: 'field', title: 'Поле №1', subtitle: '20 га', url: '/fields/1' },
  { id: '2', type: 'warehouse', title: 'Склад центральний', subtitle: 'Київ', url: '/warehouses/2' },
  { id: '3', type: 'machine', title: 'Трактор A', subtitle: 'John Deere', url: '/machines/3' },
];

const renderPalette = (props: Partial<{ open: boolean; onClose: () => void }> = {}) => {
  const onClose = props.onClose ?? vi.fn();
  const utils = render(
    <MemoryRouter>
      <CommandPalette open={props.open ?? true} onClose={onClose} />
    </MemoryRouter>,
  );
  return { ...utils, onClose };
};

const typeQuery = async (term: string) => {
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: term } });
  return input;
};

const waitForOptions = (count: number) =>
  waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(count));

beforeEach(() => {
  navigateMock.mockReset();
  globalSearchMock.mockReset();
  globalSearchMock.mockResolvedValue([]);
});

/* ── Open / close ──────────────────────────────────────────────────── */

describe('CommandPalette — open / close', () => {
  it('renders the palette content when open', () => {
    renderPalette();
    expect(screen.getByPlaceholderText('Пошук')).toBeInTheDocument();
  });

  it('does not render any palette content when open=false', () => {
    renderPalette({ open: false });
    expect(screen.queryByPlaceholderText('Пошук')).not.toBeInTheDocument();
  });
});

/* ── Input semantics ───────────────────────────────────────────────── */

describe('CommandPalette — input semantics', () => {
  it('exposes the input as a combobox with an accessible name', () => {
    renderPalette();
    expect(screen.getByRole('combobox', { name: 'Пошук' })).toBeInTheDocument();
  });

  it('connects the input to the listbox via aria-controls', async () => {
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette();
    const input = await typeQuery('Поле');
    await waitForOptions(3);
    expect(input.getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
  });

  it('aria-expanded is false when no results and true once results land', async () => {
    globalSearchMock.mockResolvedValue([]);
    renderPalette();
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    globalSearchMock.mockResolvedValue(sampleResults);
    fireEvent.change(input, { target: { value: 'Поле' } });
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  });

  it('declares aria-autocomplete="list"', () => {
    renderPalette();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
  });
});

/* ── Listbox & options ────────────────────────────────────────────── */

describe('CommandPalette — listbox & options', () => {
  it('renders results inside a listbox container', async () => {
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette();
    await typeQuery('Поле');
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('each option carries a deterministic id and a row-summary accessible name', async () => {
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette();
    await typeQuery('Поле');
    await waitForOptions(3);
    const opts = screen.getAllByRole('option');
    opts.forEach((opt) => expect(opt.id).toMatch(/^cmdpal-option-/));
    // Composed name: "{typeLabel}: {title} — {subtitle}"
    expect(opts[0]).toHaveAccessibleName('Поле: Поле №1 — 20 га');
    expect(opts[1]).toHaveAccessibleName('Склад: Склад центральний — Київ');
  });

  it('initial active option is the first result and is aria-selected', async () => {
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette();
    await typeQuery('Поле');
    await waitForOptions(3);
    const opts = screen.getAllByRole('option');
    expect(opts[0]).toHaveAttribute('aria-selected', 'true');
    expect(opts[1]).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('combobox').getAttribute('aria-activedescendant')).toBe(
      opts[0].id,
    );
  });

  it('renders the empty state for a 2+ char query with no matches and hides the listbox', async () => {
    globalSearchMock.mockResolvedValue([]);
    renderPalette();
    await typeQuery('xx');
    await waitFor(() => expect(screen.getByText('Немає результатів')).toBeInTheDocument());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not expose the decorative type Tag as an extra interactive control', async () => {
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette();
    await typeQuery('Поле');
    await waitForOptions(3);
    // The Tag carries the type label but is aria-hidden — it must
    // not surface as a button. Only role=option should match the
    // type-label text, never role=button.
    expect(screen.queryByRole('button', { name: 'Поле' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Склад' })).not.toBeInTheDocument();
  });
});

/* ── Keyboard navigation ──────────────────────────────────────────── */

describe('CommandPalette — keyboard navigation', () => {
  it('ArrowDown advances the active option and updates aria-activedescendant', async () => {
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette();
    const input = await typeQuery('Поле');
    await waitForOptions(3);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const opts = screen.getAllByRole('option');
    expect(input.getAttribute('aria-activedescendant')).toBe(opts[1].id);
    expect(opts[1]).toHaveAttribute('aria-selected', 'true');
    expect(opts[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('ArrowUp moves the active option back', async () => {
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette();
    const input = await typeQuery('Поле');
    await waitForOptions(3);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const opts = screen.getAllByRole('option');
    expect(input.getAttribute('aria-activedescendant')).toBe(opts[1].id);
  });

  it('ArrowDown does not overshoot the last option', async () => {
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette();
    const input = await typeQuery('Поле');
    await waitForOptions(3);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const opts = screen.getAllByRole('option');
    expect(input.getAttribute('aria-activedescendant')).toBe(opts[2].id);
  });

  it('ArrowUp does not undershoot the first option', async () => {
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette();
    const input = await typeQuery('Поле');
    await waitForOptions(3);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const opts = screen.getAllByRole('option');
    expect(input.getAttribute('aria-activedescendant')).toBe(opts[0].id);
  });

  it('Enter activates the active option (closes palette + navigates)', async () => {
    const onClose = vi.fn();
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette({ onClose });
    const input = await typeQuery('Поле');
    await waitForOptions(3);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/warehouses/2');
  });

  it('Escape closes the palette explicitly', () => {
    const onClose = vi.fn();
    renderPalette({ onClose });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

/* ── Click activation ─────────────────────────────────────────────── */

describe('CommandPalette — click activation', () => {
  it('clicking an option closes the palette and navigates to its url', async () => {
    const onClose = vi.fn();
    globalSearchMock.mockResolvedValue(sampleResults);
    renderPalette({ onClose });
    await typeQuery('Поле');
    await waitForOptions(3);
    fireEvent.click(screen.getAllByRole('option')[2]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/machines/3');
  });
});
