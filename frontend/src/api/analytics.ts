import apiClient from './axios';
import type { DashboardDto } from '../types/analytics';

export const getDashboard = () =>
  apiClient.get<DashboardDto>('/api/analytics/dashboard').then((r) => r.data);
