import apiClient from './axios';

export interface NotificationDto {
  id: string;
  type: string;   // 'info' | 'warning' | 'error'
  title: string;
  body: string;
  isRead: boolean;
  createdAtUtc: string;
}

export const getNotifications = (params?: { unreadOnly?: boolean; page?: number; pageSize?: number }) =>
  apiClient.get<NotificationDto[]>('/api/notifications', { params }).then((r) => r.data);

export const markNotificationRead = (id: string) =>
  apiClient.put(`/api/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  apiClient.put('/api/notifications/read-all');

export const clearReadNotifications = () =>
  apiClient.delete('/api/notifications');
