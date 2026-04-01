import apiClient from './client';
import type { MachineDto, MachineDetailDto } from '../types/machinery';
import type { PaginatedResult } from '../types/common';

export const getMachines = (params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<PaginatedResult<MachineDto>>('/api/machinery', { params }).then((r) => r.data);

export const getMachineById = (id: string) =>
  apiClient.get<MachineDetailDto>(`/api/machinery/${id}`).then((r) => r.data);

export const createMachine = (data: {
  name: string;
  inventoryNumber: string;
  type: string;
  brand?: string;
  model?: string;
  year?: number;
  fuelType: string;
  fuelConsumptionPerHour?: number;
}) =>
  apiClient.post<MachineDto>('/api/machinery', data).then((r) => r.data);

export const updateMachine = (id: string, data: Partial<MachineDto>) =>
  apiClient.put<MachineDto>(`/api/machinery/${id}`, data).then((r) => r.data);

export const deleteMachine = (id: string) =>
  apiClient.delete(`/api/machinery/${id}`);

// MachineId must be included in the body — controller validates route id == body MachineId
export const addWorkLog = (machineId: string, data: {
  date: string;
  hoursWorked: number;
  description?: string;
}) =>
  apiClient
    .post(`/api/machinery/${machineId}/work-logs`, { machineId, ...data })
    .then((r) => r.data);

// FuelType is required by the backend AddFuelLogCommand; pass machine's fuelType automatically
export const addFuelLog = (machineId: string, data: {
  date: string;
  quantity: number;
  fuelType: string;
  note?: string;
}) =>
  apiClient
    .post(`/api/machinery/${machineId}/fuel-logs`, { machineId, ...data })
    .then((r) => r.data);
