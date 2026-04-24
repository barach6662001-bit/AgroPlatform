import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FieldCard from '../FieldCard';
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
      crops: {
        Wheat: 'Пшениця',
        Corn: 'Кукурудза',
      },
      fields: {
        details: 'Деталі',
        notSeeded: 'Не засіяно',
        ownershipOwnLand: 'Власність',
        ownershipLease: 'Оренда',
        ownershipShareLease: 'Пай',
      },
    },
    lang: 'uk',
    setLang: vi.fn(),
  }),
}));

/* ── Helpers ───────────────────────────────────────────────────────── */

const baseField: FieldDto = {
  id: 'field-42',
  name: 'Південне поле',
  areaHectares: 12.34,
  cadastralNumber: '7120884600:01:001:0042',
  currentCrop: 'Wheat',
  ownershipType: 0,
};

const renderCard = (overrides: Partial<FieldDto> = {}) =>
  render(
    <MemoryRouter>
      <FieldCard field={{ ...baseField, ...overrides }} />
    </MemoryRouter>,
  );

beforeEach(() => navigateMock.mockReset());

/* ── Tests ─────────────────────────────────────────────────────────── */

describe('FieldCard — primary render', () => {
  it('renders the field name, area badge, cadastral and crop pill', () => {
    renderCard();

    expect(screen.getByText('Південне поле')).toBeInTheDocument();
    expect(screen.getByText('12.3 га')).toBeInTheDocument();
    expect(screen.getByText('7120884600:01:001:0042')).toBeInTheDocument();
    expect(screen.getByText('Пшениця')).toBeInTheDocument();
    expect(screen.getByText('Власність')).toBeInTheDocument();
  });

  it('omits the cadastral number when none is supplied', () => {
    renderCard({ cadastralNumber: undefined });
    expect(
      screen.queryByText('7120884600:01:001:0042'),
    ).not.toBeInTheDocument();
  });

  it('renders the hover-CTA label inside an aria-hidden decorative overlay', () => {
    renderCard();

    // The CTA is no longer a real <button>; it is a presentational <span>
    // inside an aria-hidden overlay. We assert the visible label is present
    // but is NOT exposed to assistive tech as an interactive control.
    expect(screen.getByText('Деталі')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Деталі' }),
    ).not.toBeInTheDocument();
  });
});

describe('FieldCard — empty crop fallback', () => {
  it('renders the "not seeded" label instead of a crop pill when currentCrop is unset', () => {
    renderCard({ currentCrop: undefined });

    expect(screen.getByText('Не засіяно')).toBeInTheDocument();
    expect(screen.queryByText('Пшениця')).not.toBeInTheDocument();
  });
});

/* ── A11y (Phase 2b) ───────────────────────────────────────────────── */

describe('FieldCard — accessibility', () => {
  it('exposes the card as a button with a descriptive accessible name', () => {
    renderCard();

    const card = screen.getByRole('button', { name: /Південне поле/ });
    expect(card).toBeInTheDocument();
    // Accessible name should summarise name + area + crop for AT users.
    expect(card).toHaveAttribute(
      'aria-label',
      'Південне поле, 12.3 га, Пшениця',
    );
  });

  it('exposes a descriptive accessible name even when no crop is set', () => {
    renderCard({ currentCrop: undefined });

    const card = screen.getByRole('button', { name: /Південне поле/ });
    expect(card).toHaveAttribute('aria-label', 'Південне поле, 12.3 га');
  });

  it('is reachable via keyboard (tabIndex=0)', () => {
    renderCard();

    const card = screen.getByRole('button', { name: /Південне поле/ });
    expect(card).toHaveAttribute('tabindex', '0');
  });
});

/* ── Activation (mouse + keyboard) ─────────────────────────────────── */

describe('FieldCard — activation', () => {
  it('navigates to /fields/{id} when the card surface is clicked', () => {
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: /Південне поле/ }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/fields/field-42');
  });

  it('navigates when Enter is pressed while the card has focus', () => {
    renderCard();
    const card = screen.getByRole('button', { name: /Південне поле/ });

    fireEvent.keyDown(card, { key: 'Enter' });

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/fields/field-42');
  });

  it('navigates when Space is pressed while the card has focus', () => {
    renderCard();
    const card = screen.getByRole('button', { name: /Південне поле/ });

    fireEvent.keyDown(card, { key: ' ' });

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/fields/field-42');
  });

  it('does not navigate on unrelated keys (e.g. Tab, Escape, Shift)', () => {
    renderCard();
    const card = screen.getByRole('button', { name: /Південне поле/ });

    fireEvent.keyDown(card, { key: 'Tab' });
    fireEvent.keyDown(card, { key: 'Escape' });
    fireEvent.keyDown(card, { key: 'Shift' });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
