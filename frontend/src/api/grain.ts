import apiClient from './axios';
import type { GrainBatchDto, GrainBatchPlacementDto, GrainMovementDto, GrainStorageDto, SplitGrainBatchResultDto, GrainTransferDto, GrainStorageOverviewDto } from '../types/grain';
import type { PaginatedResult } from '../types/common';

export interface GrainSummaryItem {
  grainType: string;
  totalTons: number;
  batchCount: number;
}

export interface CreateGrainBatchRequest {
  grainStorageId: string;
  grainType: string;
  initialQuantityTons: number;
  ownershipType: number;
  ownerName?: string;
  contractNumber?: string;
  pricePerTon?: number;
  receivedDate: string;
  sourceFieldId?: string;
  moisturePercent?: number;
  notes?: string;
}

export interface AddGrainBatchPlacementRequest {
  grainStorageId: string;
  grainStorageUnitId?: string;
  quantityTons: number;
}

// --- Grain Storage Facilities ---
export const getGrainStorages = (params?: { activeOnly?: boolean }) =>
  apiClient.get<GrainStorageDto[]>('/api/grain-storages', { params }).then(r => r.data);

export const createGrainStorage = (data: Partial<GrainStorageDto>) =>
  apiClient.post<{ id: string }>('/api/grain-storages', data).then(r => r.data);

export const updateGrainStorage = (id: string, data: Partial<GrainStorageDto>) =>
  apiClient.put(`/api/grain-storages/${id}`, data).then(r => r.data);

export const deleteGrainStorage = (id: string) =>
  apiClient.delete(`/api/grain-storages/${id}`).then(r => r.data);

export const getGrainStorageOverview = (params?: { activeOnly?: boolean; storageId?: string }) =>
  apiClient.get<GrainStorageOverviewDto[]>('/api/grain-storages/overview', { params }).then(r => r.data);

// --- Grain Batches ---
export const getGrainBatches = (params?: { storageId?: string; ownershipType?: number; page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<GrainBatchDto>>('/api/grain-batches', { params }).then(r => r.data);

export const createGrainBatch = (data: CreateGrainBatchRequest) =>
  apiClient.post<{ id: string }>('/api/grain-batches', data).then(r => r.data);

// --- Grain Placements ---
export const addGrainBatchPlacement = (batchId: string, data: AddGrainBatchPlacementRequest) =>
  apiClient.post<{ id: string }>(`/api/grain-batches/${batchId}/placements`, data).then(r => r.data);

// --- Grain Movements ---
export const createGrainMovement = (batchId: string, data: Partial<GrainMovementDto>) =>
  apiClient.post<{ id: string }>(`/api/grain-batches/${batchId}/movements`, data).then(r => r.data);

export const getGrainMovements = (batchId: string) =>
  apiClient.get<GrainMovementDto[]>(`/api/grain-batches/${batchId}/movements`).then(r => r.data);

export const getGrainTypes = () =>
  apiClient.get<string[]>('/api/grain-types').then(r => r.data);

export const addGrainType = (name: string) =>
  apiClient.post('/api/grain-types', { name }).then(r => r.data);

export const getGrainSummary = () =>
  apiClient.get<GrainSummaryItem[]>('/api/grain-batches/summary').then(r => r.data);

export interface SplitTarget {
  targetStorageId: string;
  quantityTons: number;
}

export const splitGrainBatch = (batchId: string, targets: SplitTarget[], notes?: string) =>
  apiClient.post<SplitGrainBatchResultDto>(`/api/grain-batches/${batchId}/split`, { targets, notes }).then(r => r.data);

export interface TransferGrainRequest {
  sourceBatchId?: string;
  targetBatchId?: string;
  targetStorageId?: string;
  quantityTons: number;
  transferDate: string;
  notes?: string;
}

export const transferGrain = (sourceBatchId: string, data: TransferGrainRequest) =>
  apiClient.post<{ id: string }>(`/api/grain-batches/${sourceBatchId}/transfers`, data).then(r => r.data);

export const getGrainTransfers = (batchId: string) =>
  apiClient.get<GrainTransferDto[]>(`/api/grain-batches/${batchId}/transfers`).then(r => r.data);
