import apiClient from './axios';
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

export const addWorkLog = (machineId: string, data: {
  date: string;
  hoursWorked: number;
  fieldId?: string;
  notes?: string;
}) =>
  apiClient.post(`/api/machinery/${machineId}/work-logs`, data).then((r) => r.data);

export const addFuelLog = (machineId: string, data: {
  date: string;
  liters: number;
  pricePerLiter?: number;
  notes?: string;
}) =>
  apiClient.post(`/api/machinery/${machineId}/fuel-logs`, data).then((r) => r.data);
