import apiClient from './client';
import type {
  GrainBatchDto,
  GrainMovementDto,
  GrainStorageDto,
  GrainStorageOverviewDto,
  GrainTransferDto,
  CreateMovementRequest,
  TransferGrainRequest,
  SplitGrainBatchRequest,
  AdjustGrainBatchRequest,
  WriteOffGrainBatchRequest,
} from '../types/grain';
import type { PaginatedResult } from '../types/common';

export interface GrainSummaryItem {
  grainType: string;
  totalTons: number;
  batchCount: number;
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

// --- Grain Batches ---
export const getGrainBatches = (params?: { storageId?: string; ownershipType?: number; page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<GrainBatchDto>>('/api/grain-batches', { params }).then(r => r.data);

export const createGrainBatch = (data: Partial<GrainBatchDto>) =>
  apiClient.post<{ id: string }>('/api/grain-batches', data).then(r => r.data);

// --- Grain Movement Ledger ---

/** Get ledger entries for a single batch (history panel). */
export const getGrainMovements = (batchId: string) =>
  apiClient.get<GrainMovementDto[]>(`/api/grain-batches/${batchId}/movements`).then(r => r.data);

/** Paginated ledger across all batches with optional filters. */
export const getGrainLedger = (params?: {
  storageId?: string;
  batchId?: string;
  movementType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<PaginatedResult<GrainMovementDto>>('/api/grain-batches/ledger', { params }).then(r => r.data);

/** Record a movement on a single batch (Issue, SaleDispatch, Receipt supplement, Adjustment, WriteOff). */
export const createGrainMovement = (batchId: string, data: CreateMovementRequest) =>
  apiClient.post<{ id: string }>(`/api/grain-batches/${batchId}/movements`, data).then(r => r.data);

/** Transfer quantity from one batch to another (linked by OperationId). Returns { operationId }. */
export const transferGrain = (data: TransferGrainRequest) =>
  apiClient.post<{ operationId: string }>('/api/grain-batches/transfer', data).then(r => r.data);

/** Split a batch into a new one (linked by OperationId). Returns { id } of the new batch. */
export const splitGrainBatch = (data: SplitGrainBatchRequest) =>
  apiClient.post<{ id: string }>('/api/grain-batches/split', data).then(r => r.data);

/** Adjust batch quantity (positive = increase, negative = decrease). */
export const adjustGrainBatch = (batchId: string, data: AdjustGrainBatchRequest) =>
  apiClient.post<{ id: string }>(`/api/grain-batches/${batchId}/adjust`, data).then(r => r.data);

/** Write off quantity from a batch. */
export const writeOffGrainBatch = (batchId: string, data: WriteOffGrainBatchRequest) =>
  apiClient.post<{ id: string }>(`/api/grain-batches/${batchId}/writeoff`, data).then(r => r.data);

// --- Grain Types ---
export const getGrainTypes = () =>
  apiClient.get<string[]>('/api/grain-types').then(r => r.data);

export const addGrainType = (name: string) =>
  apiClient.post('/api/grain-types', { name }).then(r => r.data);

// --- Grain Storage Overview ---
export const getGrainStorageOverview = (params?: { activeOnly?: boolean; storageId?: string }) =>
  apiClient.get<GrainStorageOverviewDto[]>('/api/grain-storages/overview', { params }).then(r => r.data);

// --- Summary ---
export const getGrainSummary = () =>
  apiClient.get<GrainSummaryItem[]>('/api/grain-batches/summary').then(r => r.data);

// --- Grain Placements ---
export const addGrainBatchPlacement = (batchId: string, data: AddGrainBatchPlacementRequest) =>
  apiClient.post<{ id: string }>(`/api/grain-batches/${batchId}/placements`, data).then(r => r.data);

export const getGrainTransfers = (batchId: string) =>
  apiClient.get<GrainTransferDto[]>(`/api/grain-batches/${batchId}/transfers`).then(r => r.data);

export interface AddGrainBatchPlacementRequest {
  grainStorageId: string;
  grainStorageUnitId?: string;
  quantityTons: number;
}

