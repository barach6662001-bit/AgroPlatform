import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FieldStatusCard from '../FieldStatusCard';
import type { FieldDto } from '../../../../types/field';

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
      dashboard: {
        fieldsStatus: 'Стан полів',
        getStarted: 'Почніть роботу',
        addFirstField: 'Додайте перше поле',
      },
      fields: {
        addField: 'Додати поле',
        notSeeded: 'Не засіяно',
      },
      crops: {
        Wheat: 'Пшениця',
        Corn: 'Кукурудза',
      },
    },
    lang: 'uk',
    setLang: vi.fn(),
  }),
}));

/* ── Helpers ───────────────────────────────────────────────────────── */

const makeField = (overrides: Partial<FieldDto> = {}): FieldDto =>
  ({
    id: 'f-1',
    name: 'Південне поле',
    areaHectares: 12.5,
    currentCrop: 'Wheat',
    ...overrides,
  } as FieldDto);

const renderCard = (fields: FieldDto[], onAddField?: () => void) =>
  render(
    <MemoryRouter>
      <FieldStatusCard fields={fields} onAddField={onAddField} />
    </MemoryRouter>,
  );

beforeEach(() => navigateMock.mockReset());

/* ── Empty state ───────────────────────────────────────────────────── */

describe('FieldStatusCard — empty state', () => {
  it('renders the getStarted placeholder when no fields are supplied', () => {
    renderCard([]);
    expect(screen.getByText('Почніть роботу')).toBeInTheDocument();
    expect(screen.getByText('Додайте перше поле')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Додати поле/ })).toBeInTheDocument();
  });

  it('addField button calls the onAddField prop when supplied', () => {
    const onAdd = vi.fn();
    renderCard([], onAdd);
    fireEvent.click(screen.getByRole('button', { name: /Додати поле/ }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('addField button navigates to /fields when onAddField is omitted', () => {
    renderCard([]);
    fireEvent.click(screen.getByRole('button', { name: /Додати поле/ }));
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/fields');
  });
});

/* ── Primary render ────────────────────────────────────────────────── */

describe('FieldStatusCard — primary render', () => {
  it('renders one row per field with name, crop label and area text', () => {
    renderCard([
      makeField(),
      makeField({ id: 'f-2', name: 'Західне поле', currentCrop: 'Corn', areaHectares: 8 }),
    ]);
    expect(screen.getByText('Південне поле')).toBeInTheDocument();
    expect(screen.getByText('Західне поле')).toBeInTheDocument();
    expect(screen.getByText('Пшениця')).toBeInTheDocument();
    expect(screen.getByText('Кукурудза')).toBeInTheDocument();
    expect(screen.getByText('12.5 га')).toBeInTheDocument();
    expect(screen.getByText('8.0 га')).toBeInTheDocument();
  });

  it('caps the list at the first 6 fields', () => {
    const seven: FieldDto[] = Array.from({ length: 7 }, (_, i) =>
      makeField({ id: `f-${i}`, name: `Поле ${i}` }),
    );
    renderCard(seven);
    expect(screen.getAllByRole('button', { name: /Поле \d+/ })).toHaveLength(6);
    expect(screen.queryByText('Поле 6')).not.toBeInTheDocument();
  });

  it('falls back to notSeeded when a field has no currentCrop', () => {
    renderCard([makeField({ currentCrop: undefined })]);
    expect(screen.getByText('Не засіяно')).toBeInTheDocument();
  });
});

/* ── Accessibility (Phase 2f) ─────────────────────────────────────── */

describe('FieldStatusCard — accessibility', () => {
  it('exposes each row as a button with a field-specific accessible name', () => {
    renderCard([makeField()]);
    const row = screen.getByRole('button', { name: /Південне поле/ });
    expect(row).toBeInTheDocument();
    expect(row.getAttribute('aria-label')).toBe('Південне поле, Пшениця, 12.5 га');
  });

  it('uses the notSeeded fallback inside the accessible name', () => {
    renderCard([makeField({ currentCrop: undefined })]);
    const row = screen.getByRole('button', { name: /Південне поле/ });
    expect(row.getAttribute('aria-label')).toBe('Південне поле, Не засіяно, 12.5 га');
  });

  it('makes each row keyboard-reachable (tabIndex=0)', () => {
    renderCard([makeField()]);
    const row = screen.getByRole('button', { name: /Південне поле/ });
    expect(row).toHaveAttribute('tabindex', '0');
  });

  it('does not expose decorative crop tag, area pill or progress bar as interactive', () => {
    renderCard([makeField()]);
    // Three buttons total when one field is present:
    //   - the header "Усі поля" CTA
    //   - the row itself
    // The cropTag / area / bar children are aria-hidden spans, not buttons.
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Пшениця' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '12.5 га' })).not.toBeInTheDocument();
  });
});

/* ── Activation (mouse + keyboard) ─────────────────────────────────── */

describe('FieldStatusCard — activation', () => {
  it('navigates to /fields when a row is clicked', () => {
    renderCard([makeField()]);
    fireEvent.click(screen.getByRole('button', { name: /Південне поле/ }));
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/fields');
  });

  it('navigates when Enter is pressed while the row has focus', () => {
    renderCard([makeField()]);
    fireEvent.keyDown(screen.getByRole('button', { name: /Південне поле/ }), { key: 'Enter' });
    expect(navigateMock).toHaveBeenCalledWith('/fields');
  });

  it('navigates when Space is pressed while the row has focus', () => {
    renderCard([makeField()]);
    fireEvent.keyDown(screen.getByRole('button', { name: /Південне поле/ }), { key: ' ' });
    expect(navigateMock).toHaveBeenCalledWith('/fields');
  });

  it('Space activation calls preventDefault to suppress page scroll', () => {
    renderCard([makeField()]);
    const row = screen.getByRole('button', { name: /Південне поле/ });
    const evt = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    row.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith('/fields');
  });

  it('does not navigate on unrelated keys (Tab, Escape, Shift, ArrowDown)', () => {
    renderCard([makeField()]);
    const row = screen.getByRole('button', { name: /Південне поле/ });
    fireEvent.keyDown(row, { key: 'Tab' });
    fireEvent.keyDown(row, { key: 'Escape' });
    fireEvent.keyDown(row, { key: 'Shift' });
    fireEvent.keyDown(row, { key: 'ArrowDown' });
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('header "Усі поля" button (real <button>) still navigates correctly', () => {
    renderCard([makeField()]);
    fireEvent.click(screen.getByRole('button', { name: /Усі поля/ }));
    expect(navigateMock).toHaveBeenCalledWith('/fields');
  });
});
