import apiClient from './client';

export interface NotificationDto {
  id: string;
  type: string;   // 'info' | 'warning' | 'error'
  title: string;
  body: string;
  isRead: boolean;
  createdAtUtc: string;
}

export const getNotifications = (params?: { unreadOnly?: boolean; page?: number; pageSize?: number }, signal?: AbortSignal) =>
  apiClient.get<NotificationDto[]>('/api/notifications', { params, signal }).then((r) => r.data);

export const markNotificationRead = (id: string) =>
  apiClient.put(`/api/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  apiClient.put('/api/notifications/read-all');

export const clearReadNotifications = () =>
  apiClient.delete('/api/notifications');

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dhKey?: string | null;
  authKey?: string | null;
  userAgent?: string | null;
}

export const registerPushSubscription = (payload: PushSubscriptionPayload) =>
  apiClient.post<{ id: string }>('/api/notifications/push-subscriptions', payload);
