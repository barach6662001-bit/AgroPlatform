import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNotifications, markNotificationRead, clearReadNotifications } from '../notifications';
import apiClient from '../axios';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getNotifications calls correct endpoint', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: [] });
    await getNotifications();
    expect(mockedApiClient.get).toHaveBeenCalledWith('/api/notifications', expect.any(Object));
  });

  it('markRead calls PUT with correct id', async () => {
    mockedApiClient.put.mockResolvedValueOnce({ data: undefined });
    await markNotificationRead('123');
    expect(mockedApiClient.put).toHaveBeenCalledWith('/api/notifications/123/read');
  });

  it('clearNotifications calls DELETE endpoint', async () => {
    mockedApiClient.delete.mockResolvedValueOnce({ data: undefined });
    await clearReadNotifications();
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/notifications');
  });
});
