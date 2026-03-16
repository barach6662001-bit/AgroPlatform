import apiClient from './axios';
import type { AgroOperationDto, AgroOperationDetailDto } from '../types/operation';
import type { PaginatedResult } from '../types/common';

export const getOperations = (params?: {
  fieldId?: string;
  operationType?: string;
  isCompleted?: boolean;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<PaginatedResult<AgroOperationDto>>('/api/agro-operations', { params }).then((r) => r.data);

export const getOperationById = (id: string) =>
  apiClient
    .get<AgroOperationDetailDto>(`/api/agro-operations/${id}`)
    .then((r) => r.data);

export const completeOperation = (id: string, data: { completedDate: string; areaProcessed?: number }) =>
  apiClient.post(`/api/agro-operations/${id}/complete`, { id, ...data }).then((r) => r.data);

export const createOperation = (data: {
  fieldId: string;
  operationType: string;
  performedAt: string;
  description?: string;
  areaProcessed?: number;
}) =>
  apiClient.post<AgroOperationDto>('/api/agro-operations', data).then((r) => r.data);

export const updateOperation = (id: string, data: Partial<AgroOperationDto>) =>
  apiClient.put<AgroOperationDto>(`/api/agro-operations/${id}`, data).then((r) => r.data);

export const deleteOperation = (id: string) =>
  apiClient.delete(`/api/agro-operations/${id}`);

export const addResource = (operationId: string, data: {
  warehouseItemId: string;
  warehouseId: string;
  plannedQuantity: number;
  unitCode: string;
}) =>
  apiClient.post(`/api/agro-operations/${operationId}/resources`, { agroOperationId: operationId, ...data }).then((r) => r.data);

export const updateResourceActual = (resourceId: string, data: { actualQuantity: number }) =>
  apiClient.put(`/api/agro-operations/resources/${resourceId}/actual`, { resourceId, ...data }).then((r) => r.data);

export const removeResource = (resourceId: string) =>
  apiClient.delete(`/api/agro-operations/resources/${resourceId}`);

export const addMachinery = (operationId: string, data: {
  machineId: string;
  hoursWorked?: number;
}) =>
  apiClient.post(`/api/agro-operations/${operationId}/machinery`, { agroOperationId: operationId, ...data }).then((r) => r.data);

export const updateMachinery = (machineryId: string, data: {
  hoursWorked?: number;
  fuelUsed?: number;
  operatorName?: string;
}) =>
  apiClient.put(`/api/agro-operations/machinery/${machineryId}`, { machineryId, ...data }).then((r) => r.data);

export const removeMachinery = (machineryId: string) =>
  apiClient.delete(`/api/agro-operations/machinery/${machineryId}`);
