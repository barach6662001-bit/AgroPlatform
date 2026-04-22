import apiClient from './axios';

export interface PlatformStatsDto {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  activeUsers: number;
  totalFields: number;
  totalAreaHectares: number;
  totalOperations: number;
  totalMachines: number;
  totalWarehouses: number;
  totalEmployees: number;
}

export const getPlatformStats = () =>
  apiClient.get<PlatformStatsDto>('/api/platform/stats').then((r) => r.data);
