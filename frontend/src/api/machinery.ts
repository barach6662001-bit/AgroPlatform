import apiClient from './axios';
import type { MachineDto, MachineDetailDto } from '../types/machinery';

export const getMachines = (params?: {
  type?: string;
  status?: string;
  search?: string;
}) =>
  apiClient.get<MachineDto[]>('/api/machinery', { params }).then((r) => r.data);

export const getMachineById = (id: string) =>
  apiClient.get<MachineDetailDto>(`/api/machinery/${id}`).then((r) => r.data);
