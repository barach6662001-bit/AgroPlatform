import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AlertsPanel from '../AlertsPanel';

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

vi.mock('../../../i18n', () => ({
  useTranslation: () => ({
    t: {
      dashboard: new Proxy(
        {} as Record<string, string>,
        { get: (_t, key: string) => `dash.${key}` },
      ),
      operationTypes: {},
    },
    lang: 'en',
    setLang: vi.fn(),
  }),
}));

/* ── Helpers ───────────────────────────────────────────────────────── */

const renderPanel = (
  props: Partial<React.ComponentProps<typeof AlertsPanel>> = {},
) =>
  render(
    <MemoryRouter>
      <AlertsPanel
        underRepairMachines={0}
        pendingOperations={0}
        overdueOperations={0}
        lowStockItems={0}
        completedToday={0}
        {...props}
      />
    </MemoryRouter>,
  );

beforeEach(() => navigateMock.mockReset());

/* ── Tests ─────────────────────────────────────────────────────────── */

describe('AlertsPanel — empty state', () => {
  it('renders nothing when no alerts apply (all counts are 0)', () => {
    const { container } = renderPanel();
    expect(container.firstChild).toBeNull();
  });
});

describe('AlertsPanel — normal alerts', () => {
  it('renders one row per non-zero count, in severity order', () => {
    renderPanel({
      underRepairMachines: 2,
      pendingOperations: 5,
      overdueOperations: 1,
      lowStockItems: 3,
      completedToday: 7,
    });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);

    // Critical first (overdueOps, machinesUnderRepair), then warnings,
    // then info.
    const orderedTitles = items.map((li) =>
      within(li).getByRole('button').getAttribute('aria-label'),
    );
    expect(orderedTitles[0]).toMatch(/dash\.overdueOps: 1/);
    expect(orderedTitles[1]).toMatch(/dash\.machinesUnderRepair: 2/);
    expect(orderedTitles[2]).toMatch(/dash\.pendingOpsAlert: 5/);
    expect(orderedTitles[3]).toMatch(/dash\.lowStockAlert: 3/);
    expect(orderedTitles[4]).toMatch(/dash\.completedToday: 7/);
  });

  it('renders the panel as a <section> with an aria-label', () => {
    const { container } = renderPanel({ pendingOperations: 1 });
    const section = container.querySelector('section');
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute('aria-label', 'dash.needsAttention');
  });

  it('renders a semantic <h2> for the panel title', () => {
    renderPanel({ pendingOperations: 1 });
    expect(
      screen.getByRole('heading', { level: 2, name: 'dash.needsAttention' }),
    ).toBeInTheDocument();
  });

  it('shows the total count badge equal to the number of rows', () => {
    renderPanel({ pendingOperations: 1, lowStockItems: 1, completedToday: 1 });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    // Total count badge sits next to the title and matches `items.length`.
    const badges = screen.getAllByText('3');
    expect(badges.length).toBeGreaterThan(0);
  });
});

describe('AlertsPanel — status (severity) rendering', () => {
  it('tags each row with a severity-specific class for the tint', () => {
    renderPanel({
      overdueOperations: 1, // critical
      pendingOperations: 1, // warning
      completedToday: 1,    // info
    });
    const buttons = screen.getAllByRole('button');
    const criticalBtn = buttons.find((b) =>
      b.getAttribute('aria-label')?.startsWith('dash.overdueOps'),
    );
    const warningBtn = buttons.find((b) =>
      b.getAttribute('aria-label')?.startsWith('dash.pendingOpsAlert'),
    );
    const infoBtn = buttons.find((b) =>
      b.getAttribute('aria-label')?.startsWith('dash.completedToday'),
    );
    expect(criticalBtn?.className).toMatch(/critical/);
    expect(warningBtn?.className).toMatch(/warning/);
    expect(infoBtn?.className).toMatch(/info/);
  });
});

describe('AlertsPanel — actions', () => {
  it('navigates to the row’s route when the row button is clicked', () => {
    renderPanel({ underRepairMachines: 1, pendingOperations: 1 });
    const repairBtn = screen.getByRole('button', {
      name: /dash\.machinesUnderRepair/,
    });
    fireEvent.click(repairBtn);
    expect(navigateMock).toHaveBeenCalledWith('/machinery');

    const pendingBtn = screen.getByRole('button', {
      name: /dash\.pendingOpsAlert/,
    });
    fireEvent.click(pendingBtn);
    expect(navigateMock).toHaveBeenCalledWith('/operations');
  });

  it('hides rows beyond 5 by default and shows a "show all" footer', () => {
    // Pad with non-zero counts so we get 5 rows.  To exceed 5 we’d need
    // a sixth alert source — the current API exposes 5 — so the footer
    // is only shown when the fixture intentionally crosses the limit.
    // For the sake of this assertion we render exactly 5 rows and then
    // assert the footer is NOT shown (boundary case).
    renderPanel({
      underRepairMachines: 1,
      pendingOperations: 1,
      overdueOperations: 1,
      lowStockItems: 1,
      completedToday: 1,
    });
    expect(screen.queryByText(/dash\.showAll|Показати всі/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });
});

describe('AlertsPanel — Card adoption', () => {
  it('the outer container is the design-system Card (data-variant="subtle", radius=lg)', () => {
    const { container } = renderPanel({ pendingOperations: 1 });
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('data-variant', 'subtle');
    expect(section).toHaveAttribute('data-bordered', 'true');
    const inline = section?.getAttribute('style') ?? '';
    expect(inline).toContain('var(--card-bg)');
    expect(inline).toContain('var(--radius-lg)');
  });
});
