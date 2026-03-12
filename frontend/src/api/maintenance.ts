import apiClient from './axios';

export interface MaintenanceRecordDto {
  id: string;
  date: string;
  type: string;
  description?: string;
  cost?: number;
  hoursAtMaintenance?: number;
}

export const getMaintenanceRecords = (machineId: string) =>
  apiClient.get<MaintenanceRecordDto[]>(`/api/machinery/${machineId}/maintenance`).then((r) => r.data);

export const addMaintenanceRecord = (machineId: string, data: {
  machineId: string;
  date: string;
  type: string;
  description?: string;
  cost?: number;
  hoursAtMaintenance?: number;
  nextMaintenanceDate?: string;
}) =>
  apiClient.post<{ id: string }>(`/api/machinery/${machineId}/maintenance`, data).then((r) => r.data);

export const exportMaintenanceRecords = (machineId: string) =>
  apiClient.get(`/api/machinery/${machineId}/maintenance/export`, { responseType: 'blob' });
