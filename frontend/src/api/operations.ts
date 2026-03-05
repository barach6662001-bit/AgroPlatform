import apiClient from './axios';
import type { AgroOperationDto, AgroOperationDetailDto } from '../types/operation';

export const getOperations = (params?: {
  fieldId?: string;
  operationType?: string;
  isCompleted?: boolean;
}) =>
  apiClient.get<AgroOperationDto[]>('/api/agro-operations', { params }).then((r) => r.data);

export const getOperationById = (id: string) =>
  apiClient
    .get<AgroOperationDetailDto>(`/api/agro-operations/${id}`)
    .then((r) => r.data);

export const completeOperation = (id: string) =>
  apiClient.post(`/api/agro-operations/${id}/complete`).then((r) => r.data);
