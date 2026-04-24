import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NotificationBell from '../NotificationBell';
import type { Notification } from '../../../hooks/useNotifications';

/* ── Mocks ─────────────────────────────────────────────────────────── */

const markAsReadMock = vi.fn();
const markAllReadMock = vi.fn();
const clearAllMock = vi.fn();
const addNotificationMock = vi.fn();

let storeState: {
  notifications: Notification[];
  unreadCount: number;
};

vi.mock('../../../hooks/useNotifications', () => ({
  useNotificationStore: () => ({
    notifications: storeState.notifications,
    markAllRead: markAllReadMock,
    clearAll: clearAllMock,
    markAsRead: markAsReadMock,
    getUnreadCount: () => storeState.unreadCount,
    addNotification: addNotificationMock,
  }),
}));

const getNotificationsMock = vi.fn();
const markAllNotificationsReadMock = vi.fn();
const clearReadNotificationsMock = vi.fn();
const markNotificationReadMock = vi.fn();

vi.mock('../../../api/notifications', () => ({
  getNotifications: (...args: unknown[]) => getNotificationsMock(...args),
  markAllNotificationsRead: (...args: unknown[]) => markAllNotificationsReadMock(...args),
  clearReadNotifications: (...args: unknown[]) => clearReadNotificationsMock(...args),
  markNotificationRead: (...args: unknown[]) => markNotificationReadMock(...args),
}));

vi.mock('../../../i18n', () => ({
  useTranslation: () => ({
    t: {
      notifications: {
        title: 'Сповіщення',
        markAllRead: 'Прочитати все',
        clearAll: 'Очистити прочитані',
        noNotifications: 'Немає сповіщень',
        loadError: 'Помилка',
        markReadError: 'Помилка позначення',
        read: 'прочитане',
        unread: 'непрочитане',
      },
    },
    lang: 'uk',
    setLang: vi.fn(),
  }),
}));

/* ── Helpers ───────────────────────────────────────────────────────── */

const makeNotif = (overrides: Partial<Notification> = {}): Notification =>
  ({
    id: 'n-1',
    type: 'info',
    message: 'Сівба завершена на полі №1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    read: false,
    ...overrides,
  } as Notification);

const openBell = async () => {
  // The bell trigger uses its aria-label for the accessible name.
  // We click it to open the Popover — Popover content renders into
  // a portal on document.body, which RTL queries by default.
  const bell = screen.getByRole('button', { name: 'Сповіщення' });
  fireEvent.click(bell);
  // Wait until at least one popover button appears (the "Mark all
  // read" / "Clear read" header CTAs render with the popover).
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Прочитати все' })).toBeInTheDocument(),
  );
};

beforeEach(() => {
  storeState = { notifications: [], unreadCount: 0 };
  markAsReadMock.mockReset();
  markAllReadMock.mockReset();
  clearAllMock.mockReset();
  addNotificationMock.mockReset();
  getNotificationsMock.mockReset();
  getNotificationsMock.mockResolvedValue([]);
  markAllNotificationsReadMock.mockReset();
  clearReadNotificationsMock.mockReset();
  markNotificationReadMock.mockReset();
  markNotificationReadMock.mockResolvedValue(undefined);
});

/* ── Bell trigger ─────────────────────────────────────────────────── */

describe('NotificationBell — trigger', () => {
  it('exposes the bell trigger with an accessible name', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('button', { name: 'Сповіщення' })).toBeInTheDocument();
  });

  it('keeps the Popover content closed until the bell is clicked', () => {
    storeState = { notifications: [makeNotif()], unreadCount: 1 };
    render(<NotificationBell />);
    // Closed: no notification button is in the DOM yet.
    expect(
      screen.queryByRole('button', { name: /Сівба завершена/ }),
    ).not.toBeInTheDocument();
  });
});

/* ── Popover content ──────────────────────────────────────────────── */

describe('NotificationBell — popover content', () => {
  it('shows the empty-state placeholder when there are no notifications', async () => {
    render(<NotificationBell />);
    await openBell();
    expect(screen.getByText('Немає сповіщень')).toBeInTheDocument();
  });

  it('renders one clickable button per notification', async () => {
    storeState = {
      notifications: [
        makeNotif({ id: 'n-1', message: 'Сівба завершена' }),
        makeNotif({ id: 'n-2', type: 'warning', message: 'Низький залишок' }),
      ],
      unreadCount: 2,
    };
    render(<NotificationBell />);
    await openBell();
    expect(screen.getByRole('button', { name: /Сівба завершена/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Низький залишок/ })).toBeInTheDocument();
  });
});

/* ── Accessibility (Phase 2h) ─────────────────────────────────────── */

describe('NotificationBell — accessibility', () => {
  it('exposes each notification as a button with a row-summary accessible name', async () => {
    storeState = {
      notifications: [makeNotif({ id: 'n-1', type: 'info', message: 'Сівба завершена' })],
      unreadCount: 1,
    };
    render(<NotificationBell />);
    await openBell();
    const item = screen.getByRole('button', { name: /Сівба завершена/ });
    const label = item.getAttribute('aria-label') ?? '';
    expect(label).toMatch(/^INFO,/);
    expect(label).toContain('непрочитане');
    expect(label).toContain('Сівба завершена');
  });

  it('uses the "read" label inside the accessible name for already-read items', async () => {
    storeState = {
      notifications: [makeNotif({ id: 'n-1', read: true, message: 'Стара подія' })],
      unreadCount: 0,
    };
    render(<NotificationBell />);
    await openBell();
    const item = screen.getByRole('button', { name: /Стара подія/ });
    expect(item.getAttribute('aria-label')).toContain('прочитане');
  });

  it('reflects severity via the uppercased type prefix in the accessible name', async () => {
    storeState = {
      notifications: [
        makeNotif({ id: 'n-1', type: 'error', message: 'Помилка синхронізації' }),
      ],
      unreadCount: 1,
    };
    render(<NotificationBell />);
    await openBell();
    const item = screen.getByRole('button', { name: /Помилка синхронізації/ });
    expect(item.getAttribute('aria-label')).toMatch(/^ERROR,/);
  });

  it('makes each notification keyboard-reachable (tabIndex=0)', async () => {
    storeState = { notifications: [makeNotif()], unreadCount: 1 };
    render(<NotificationBell />);
    await openBell();
    const item = screen.getByRole('button', { name: /Сівба завершена/ });
    expect(item).toHaveAttribute('tabindex', '0');
  });

  it('does not expose decorative severity tag or relative-time text as extra buttons', async () => {
    storeState = { notifications: [makeNotif()], unreadCount: 1 };
    render(<NotificationBell />);
    await openBell();
    // The severity "INFO" tag and the "5 min ago" text carry
    // aria-hidden="true". With an exact-string name match they
    // must NOT surface as separate buttons (the row itself has a
    // longer composed aria-label "INFO, 5 min ago, ...", which
    // would not equal "INFO" or "5 min ago" verbatim).
    expect(screen.queryByRole('button', { name: 'INFO' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '5 min ago' })).not.toBeInTheDocument();
    // And exactly one row-button exists for the single notification.
    expect(
      screen.getAllByRole('button', { name: /Сівба завершена на полі №1/ }),
    ).toHaveLength(1);
  });
});

/* ── Activation ────────────────────────────────────────────────────── */

describe('NotificationBell — activation', () => {
  it('marks the notification as read when its row is clicked', async () => {
    storeState = { notifications: [makeNotif({ id: 'n-42' })], unreadCount: 1 };
    render(<NotificationBell />);
    await openBell();
    fireEvent.click(screen.getByRole('button', { name: /Сівба завершена/ }));
    await waitFor(() => expect(markNotificationReadMock).toHaveBeenCalledWith('n-42'));
    expect(markAsReadMock).toHaveBeenCalledWith('n-42');
  });

  it('marks the notification as read when Enter is pressed', async () => {
    storeState = { notifications: [makeNotif({ id: 'n-42' })], unreadCount: 1 };
    render(<NotificationBell />);
    await openBell();
    fireEvent.keyDown(screen.getByRole('button', { name: /Сівба завершена/ }), { key: 'Enter' });
    await waitFor(() => expect(markNotificationReadMock).toHaveBeenCalledWith('n-42'));
  });

  it('marks the notification as read when Space is pressed', async () => {
    storeState = { notifications: [makeNotif({ id: 'n-42' })], unreadCount: 1 };
    render(<NotificationBell />);
    await openBell();
    fireEvent.keyDown(screen.getByRole('button', { name: /Сівба завершена/ }), { key: ' ' });
    await waitFor(() => expect(markNotificationReadMock).toHaveBeenCalledWith('n-42'));
  });

  it('Space activation calls preventDefault to suppress page scroll', async () => {
    storeState = { notifications: [makeNotif({ id: 'n-42' })], unreadCount: 1 };
    render(<NotificationBell />);
    await openBell();
    const item = screen.getByRole('button', { name: /Сівба завершена/ });
    const evt = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    item.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
  });

  it('does not activate on unrelated keys (Tab, Escape, Shift, ArrowDown)', async () => {
    storeState = { notifications: [makeNotif({ id: 'n-42' })], unreadCount: 1 };
    render(<NotificationBell />);
    await openBell();
    const item = screen.getByRole('button', { name: /Сівба завершена/ });
    fireEvent.keyDown(item, { key: 'Tab' });
    fireEvent.keyDown(item, { key: 'Escape' });
    fireEvent.keyDown(item, { key: 'Shift' });
    fireEvent.keyDown(item, { key: 'ArrowDown' });
    expect(markNotificationReadMock).not.toHaveBeenCalled();
    expect(markAsReadMock).not.toHaveBeenCalled();
  });
});
