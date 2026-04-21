import apiClient from './client';
import type { UserDto } from '../types/users';

export const getUsers = () =>
  apiClient.get<UserDto[]>('/api/users').then((r) => r.data);

export const updateUserRole = (userId: string, role: string) =>
  apiClient.put(`/api/users/${userId}/role`, { userId, role });
