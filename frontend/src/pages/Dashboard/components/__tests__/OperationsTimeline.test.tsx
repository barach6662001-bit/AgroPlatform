import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OperationsTimeline from '../OperationsTimeline';
import type { AgroOperationDto } from '../../../../types/operation';

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

vi.mock('../../../../i18n', () => ({
  useTranslation: () => ({
    t: {
      operationTypes: {
        Sowing: 'Сівба',
        Fertilizing: 'Внесення добрив',
        Harvesting: 'Збір врожаю',
      },
      operations: {
        completed: 'Завершена',
        inProgress: 'В роботі',
      },
      dashboard: {
        noActivity: 'Немає нещодавньої активності',
      },
    },
    lang: 'uk',
    setLang: vi.fn(),
  }),
}));

/* ── Helpers ───────────────────────────────────────────────────────── */

const makeOp = (overrides: Partial<AgroOperationDto> = {}): AgroOperationDto => ({
  id: 'op-7',
  operationType: 'Sowing',
  fieldId: 'field-1',
  fieldName: 'Південне поле',
  plannedDate: '2026-04-20',
  completedDate: '2026-04-22',
  isCompleted: true,
  ...overrides,
} as AgroOperationDto);

const renderTimeline = (ops: AgroOperationDto[]) =>
  render(
    <MemoryRouter>
      <OperationsTimeline operations={ops} />
    </MemoryRouter>,
  );

beforeEach(() => navigateMock.mockReset());

/* ── Empty state ───────────────────────────────────────────────────── */

describe('OperationsTimeline — empty state', () => {
  it('renders the no-activity message when no operations are supplied', () => {
    renderTimeline([]);
    expect(
      screen.getByText('Немає нещодавньої активності'),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

/* ── Render ────────────────────────────────────────────────────────── */

describe('OperationsTimeline — primary render', () => {
  it('renders one row per operation with its label, field name and a status badge', () => {
    renderTimeline([
      makeOp(),
      makeOp({
        id: 'op-8',
        operationType: 'Harvesting',
        fieldName: 'Західне поле',
        isCompleted: false,
        completedDate: undefined,
      }),
    ]);

    expect(screen.getByText('Сівба')).toBeInTheDocument();
    expect(screen.getByText('Південне поле')).toBeInTheDocument();
    expect(screen.getByText('Збір врожаю')).toBeInTheDocument();
    expect(screen.getByText('Західне поле')).toBeInTheDocument();
    // Both completed and in-progress badge labels appear once each.
    expect(screen.getByText('Завершена')).toBeInTheDocument();
    expect(screen.getByText('В роботі')).toBeInTheDocument();
  });

  it('exposes exactly one button per operation row', () => {
    renderTimeline([makeOp(), makeOp({ id: 'op-8' })]);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});

/* ── A11y (Phase 2c) ───────────────────────────────────────────────── */

describe('OperationsTimeline — accessibility', () => {
  it('gives each row an accessible name summarising the operation', () => {
    renderTimeline([makeOp()]);

    const row = screen.getByRole('button', { name: /Сівба/ });
    expect(row).toBeInTheDocument();
    // Accessible name should include type, field, status (and the
    // visible relative date when present).
    expect(row.getAttribute('aria-label')).toMatch(/^Сівба, Південне поле, Завершена/);
  });

  it('gives in-progress rows the in-progress status in their accessible name', () => {
    renderTimeline([
      makeOp({
        id: 'op-9',
        isCompleted: false,
        completedDate: undefined,
      }),
    ]);
    const row = screen.getByRole('button', { name: /Сівба/ });
    expect(row.getAttribute('aria-label')).toMatch(/В роботі/);
  });

  it('makes each row keyboard-reachable (tabIndex=0)', () => {
    renderTimeline([makeOp()]);
    const row = screen.getByRole('button', { name: /Сівба/ });
    expect(row).toHaveAttribute('tabindex', '0');
  });

  it('does not expose the decorative status badge as a nested button', () => {
    renderTimeline([makeOp()]);
    // The badge text is duplicated inside the row's aria-label, so the
    // badge itself must not surface as an interactive control.
    expect(
      screen.queryByRole('button', { name: 'Завершена' }),
    ).not.toBeInTheDocument();
    // Exactly one button (the row itself) — no nested buttons.
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

/* ── Activation (mouse + keyboard) ─────────────────────────────────── */

describe('OperationsTimeline — activation', () => {
  it('navigates to /operations/{id} when a row is clicked', () => {
    renderTimeline([makeOp()]);

    fireEvent.click(screen.getByRole('button', { name: /Сівба/ }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-7');
  });

  it('navigates when Enter is pressed while the row has focus', () => {
    renderTimeline([makeOp()]);
    const row = screen.getByRole('button', { name: /Сівба/ });

    fireEvent.keyDown(row, { key: 'Enter' });

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-7');
  });

  it('navigates when Space is pressed while the row has focus', () => {
    renderTimeline([makeOp()]);
    const row = screen.getByRole('button', { name: /Сівба/ });

    fireEvent.keyDown(row, { key: ' ' });

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-7');
  });

  it('Space activation calls preventDefault to suppress page scroll', () => {
    renderTimeline([makeOp()]);
    const row = screen.getByRole('button', { name: /Сівба/ });

    const evt = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    row.dispatchEvent(evt);

    expect(evt.defaultPrevented).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-7');
  });

  it('does not navigate on unrelated keys (Tab, Escape, Shift, ArrowDown)', () => {
    renderTimeline([makeOp()]);
    const row = screen.getByRole('button', { name: /Сівба/ });

    fireEvent.keyDown(row, { key: 'Tab' });
    fireEvent.keyDown(row, { key: 'Escape' });
    fireEvent.keyDown(row, { key: 'Shift' });
    fireEvent.keyDown(row, { key: 'ArrowDown' });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('routes to the correct operation id when multiple rows are present', () => {
    renderTimeline([
      makeOp({ id: 'op-A', operationType: 'Sowing', fieldName: 'A' }),
      makeOp({ id: 'op-B', operationType: 'Harvesting', fieldName: 'B' }),
    ]);

    fireEvent.click(screen.getByRole('button', { name: /Збір врожаю/ }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-B');
  });
});
