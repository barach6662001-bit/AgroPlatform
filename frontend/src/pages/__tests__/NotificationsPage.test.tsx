import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationsPage from '../Notifications/NotificationsPage';
import * as notificationsApi from '../../api/notifications';

vi.mock('../../api/notifications', () => ({
  getNotifications: vi.fn(() => Promise.resolve([])),
  markNotificationRead: vi.fn(() => Promise.resolve()),
  markAllNotificationsRead: vi.fn(() => Promise.resolve()),
  clearReadNotifications: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../i18n', () => ({
  useTranslation: () => ({
    t: {
      notifications: {
        title: 'Notifications',
        markAllRead: 'Mark all read',
        clearAll: 'Clear read',
        noNotifications: 'No notifications',
        loadError: 'Error loading notifications',
        markReadError: 'Error marking as read',
      },
      common: {
        date: 'Date',
        actions: 'Actions',
      },
    },
    lang: 'en',
    setLang: vi.fn(),
  }),
}));

vi.mock('../../hooks/useRole', () => ({
  useRole: () => ({ isAdmin: true, hasRole: () => true }),
}));

function renderNotificationsPage() {
  return render(
    <MemoryRouter>
      <NotificationsPage />
    </MemoryRouter>,
  );
}

describe('NotificationsPage', () => {
  it('renders notifications page', () => {
    renderNotificationsPage();
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('shows unread filter checkbox', () => {
    renderNotificationsPage();
    const checkbox = document.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
  });

  it('calls markAllRead on button click', async () => {
    renderNotificationsPage();
    const button = screen.getByRole('button', { name: /mark all read/i });
    fireEvent.click(button);
    expect(notificationsApi.markAllNotificationsRead).toHaveBeenCalled();
  });
});
