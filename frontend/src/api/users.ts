import apiClient from './axios';
import type { UserDto } from '../types/users';

export const getUsers = () =>
  apiClient.get<UserDto[]>('/api/users').then((r) => r.data);

export const updateUserRole = (userId: string, role: string) =>
  apiClient.put(`/api/users/${userId}/role`, { userId, role });

export const resetUserPassword = (userId: string, newPassword: string) =>
  apiClient.put(`/api/users/${userId}/reset-password`, { userId, newPassword });
