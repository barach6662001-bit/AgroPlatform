import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import dayjs from 'dayjs';
import UpcomingPanel from '../UpcomingPanel';
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
      dashboard: {
        noUpcoming: 'Немає запланованих',
        haUnit: 'га',
      },
    },
    lang: 'uk',
    setLang: vi.fn(),
  }),
}));

/* ── Helpers ───────────────────────────────────────────────────────── */

const today = dayjs().startOf('day');
const isoTomorrow = today.add(1, 'day').format('YYYY-MM-DD');
const isoIn3Days = today.add(3, 'day').format('YYYY-MM-DD');
const isoYesterday = today.subtract(1, 'day').format('YYYY-MM-DD');
const isoIn30Days = today.add(30, 'day').format('YYYY-MM-DD');

const makeOp = (overrides: Partial<AgroOperationDto> = {}): AgroOperationDto =>
  ({
    id: 'op-1',
    operationType: 'Sowing',
    fieldId: 'f-1',
    fieldName: 'Південне поле',
    plannedDate: isoTomorrow,
    isCompleted: false,
    ...overrides,
  } as AgroOperationDto);

const renderPanel = (
  ops: AgroOperationDto[],
  weather?: { tempC: number; condition: 'clear' | 'cloudy'; location: string },
) =>
  render(
    <MemoryRouter>
      <UpcomingPanel operations={ops} weather={weather} />
    </MemoryRouter>,
  );

beforeEach(() => navigateMock.mockReset());

/* ── Empty state ───────────────────────────────────────────────────── */

describe('UpcomingPanel — empty state', () => {
  it('renders the empty placeholder when no operations supplied', () => {
    renderPanel([]);
    expect(screen.getByText('Немає запланованих')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders the empty placeholder when all operations are already completed', () => {
    renderPanel([makeOp({ isCompleted: true })]);
    expect(screen.getByText('Немає запланованих')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders the empty placeholder when operations fall outside the 7-day window', () => {
    renderPanel([
      makeOp({ id: 'past', plannedDate: isoYesterday }),
      makeOp({ id: 'far', plannedDate: isoIn30Days }),
    ]);
    expect(screen.getByText('Немає запланованих')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

/* ── Render ────────────────────────────────────────────────────────── */

describe('UpcomingPanel — primary render', () => {
  it('renders one row per upcoming operation with type, field name and date chip', () => {
    renderPanel([
      makeOp(),
      makeOp({
        id: 'op-2',
        operationType: 'Harvesting',
        fieldName: 'Західне поле',
        plannedDate: isoIn3Days,
      }),
    ]);

    expect(screen.getByText('Сівба')).toBeInTheDocument();
    expect(screen.getByText('Південне поле')).toBeInTheDocument();
    expect(screen.getByText('Збір врожаю')).toBeInTheDocument();
    expect(screen.getByText('Західне поле')).toBeInTheDocument();
    // Both date chips rendered (DD MMM format from dayjs).
    expect(screen.getByText(dayjs(isoTomorrow).format('DD MMM'))).toBeInTheDocument();
    expect(screen.getByText(dayjs(isoIn3Days).format('DD MMM'))).toBeInTheDocument();
  });

  it('renders the area suffix when areaProcessed > 0', () => {
    renderPanel([makeOp({ areaProcessed: 12.5 } as Partial<AgroOperationDto>)]);
    expect(screen.getByText('12.5 га')).toBeInTheDocument();
  });

  it('omits the area suffix when areaProcessed is missing or zero', () => {
    renderPanel([makeOp({ areaProcessed: 0 } as Partial<AgroOperationDto>)]);
    // No element should match the "<num> га" pattern.
    expect(screen.queryByText(/^\d.*га$/)).not.toBeInTheDocument();
  });

  it('renders the optional weather strip when weather prop is supplied', () => {
    renderPanel([makeOp()], { tempC: 18, condition: 'clear', location: 'Київ' });
    expect(screen.getByText('+18°C')).toBeInTheDocument();
    expect(screen.getByText('· Київ')).toBeInTheDocument();
  });

  it('exposes exactly one button per upcoming row (no nested interactives)', () => {
    renderPanel([makeOp(), makeOp({ id: 'op-2', plannedDate: isoIn3Days })]);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});

/* ── A11y (Phase 2d) ───────────────────────────────────────────────── */

describe('UpcomingPanel — accessibility', () => {
  it('gives each row an accessible name summarising the operation', () => {
    renderPanel([makeOp()]);
    const row = screen.getByRole('button', { name: /Сівба/ });
    expect(row).toBeInTheDocument();
    expect(row.getAttribute('aria-label')).toBe(
      `Сівба, Південне поле, ${dayjs(isoTomorrow).format('DD MMM')}`,
    );
  });

  it('appends the area suffix into the accessible name when present', () => {
    renderPanel([makeOp({ areaProcessed: 7 } as Partial<AgroOperationDto>)]);
    const row = screen.getByRole('button', { name: /Сівба/ });
    expect(row.getAttribute('aria-label')).toBe(
      `Сівба, Південне поле, ${dayjs(isoTomorrow).format('DD MMM')}, 7 га`,
    );
  });

  it('makes each row keyboard-reachable (tabIndex=0)', () => {
    renderPanel([makeOp()]);
    const row = screen.getByRole('button', { name: /Сівба/ });
    expect(row).toHaveAttribute('tabindex', '0');
  });

  it('does not expose decorative date chip or area pill as interactive elements', () => {
    renderPanel([makeOp({ areaProcessed: 7 } as Partial<AgroOperationDto>)]);
    // Only the row itself should be a button; the date chip and the
    // area pill are presentational <span>s with aria-hidden.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(
      screen.queryByRole('button', { name: dayjs(isoTomorrow).format('DD MMM') }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '7 га' })).not.toBeInTheDocument();
  });
});

/* ── Activation (mouse + keyboard) ─────────────────────────────────── */

describe('UpcomingPanel — activation', () => {
  it('navigates to /operations/{id} when a row is clicked', () => {
    renderPanel([makeOp({ id: 'op-77' })]);
    fireEvent.click(screen.getByRole('button', { name: /Сівба/ }));
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-77');
  });

  it('navigates when Enter is pressed while the row has focus', () => {
    renderPanel([makeOp({ id: 'op-77' })]);
    fireEvent.keyDown(screen.getByRole('button', { name: /Сівба/ }), { key: 'Enter' });
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-77');
  });

  it('navigates when Space is pressed while the row has focus', () => {
    renderPanel([makeOp({ id: 'op-77' })]);
    fireEvent.keyDown(screen.getByRole('button', { name: /Сівба/ }), { key: ' ' });
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-77');
  });

  it('Space activation calls preventDefault to suppress page scroll', () => {
    renderPanel([makeOp({ id: 'op-77' })]);
    const row = screen.getByRole('button', { name: /Сівба/ });
    const evt = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    row.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-77');
  });

  it('does not navigate on unrelated keys (Tab, Escape, Shift, ArrowDown)', () => {
    renderPanel([makeOp()]);
    const row = screen.getByRole('button', { name: /Сівба/ });

    fireEvent.keyDown(row, { key: 'Tab' });
    fireEvent.keyDown(row, { key: 'Escape' });
    fireEvent.keyDown(row, { key: 'Shift' });
    fireEvent.keyDown(row, { key: 'ArrowDown' });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('routes to the correct id when multiple rows are present', () => {
    renderPanel([
      makeOp({ id: 'op-A', operationType: 'Sowing' }),
      makeOp({ id: 'op-B', operationType: 'Harvesting', plannedDate: isoIn3Days }),
    ]);

    fireEvent.click(screen.getByRole('button', { name: /Збір врожаю/ }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/operations/op-B');
  });
});
