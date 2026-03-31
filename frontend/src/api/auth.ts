import apiClient from './axios';
import type { AuthResponse, LoginRequest, ChangePasswordRequest } from '../types/auth';

export const login = (data: LoginRequest) =>
  apiClient.post<AuthResponse>('/api/auth/login', data).then((r) => r.data);

export const changePassword = (data: ChangePasswordRequest) =>
  apiClient.post<AuthResponse>('/api/auth/change-password', data).then((r) => r.data);
