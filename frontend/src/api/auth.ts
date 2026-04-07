import apiClient from './axios';
import type { AuthResponse, LoginRequest, ChangePasswordRequest, RefreshTokenRequest } from '../types/auth';

export const login = (data: LoginRequest) =>
  apiClient.post<AuthResponse>('/api/auth/login', data).then((r) => r.data);

export const changePassword = (data: ChangePasswordRequest) =>
  apiClient.post<AuthResponse>('/api/auth/change-password', data).then((r) => r.data);

export const completeOnboarding = () =>
  apiClient.post("/api/auth/complete-onboarding").then((r) => r.data);

export const refreshTokenRequest = (data: RefreshTokenRequest) =>
  apiClient.post<AuthResponse>('/api/auth/refresh', data).then((r) => r.data);

export const revokeRefreshToken = (data: RefreshTokenRequest) =>
  apiClient.post('/api/auth/revoke', data);
