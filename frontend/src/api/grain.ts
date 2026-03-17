import apiClient from './axios';
import type { GrainBatchDto, GrainMovementDto } from '../types/grain';
import type { PaginatedResult } from '../types/common';

export const getGrainBatches = (params?: { storageId?: string; ownershipType?: number; page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<GrainBatchDto>>('/api/grain-batches', { params }).then(r => r.data);

export const createGrainBatch = (data: Partial<GrainBatchDto>) =>
  apiClient.post<{ id: string }>('/api/grain-batches', data).then(r => r.data);

export const createGrainMovement = (batchId: string, data: Partial<GrainMovementDto>) =>
  apiClient.post<{ id: string }>(`/api/grain-batches/${batchId}/movements`, data).then(r => r.data);

export const getGrainMovements = (batchId: string) =>
  apiClient.get<GrainMovementDto[]>(`/api/grain-batches/${batchId}/movements`).then(r => r.data);
