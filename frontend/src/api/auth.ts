import apiClient from './axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const login = (data: LoginRequest) =>
  apiClient.post<AuthResponse>('/api/auth/login', data).then((r) => r.data);

export const register = (data: RegisterRequest) =>
  apiClient.post<AuthResponse>('/api/auth/register', data).then((r) => r.data);
