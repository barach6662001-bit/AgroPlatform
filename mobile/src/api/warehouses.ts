import apiClient from './client';
import type { WarehouseDto, WarehouseItemDto, BalanceDto, StockMoveDto, ItemCategoryDto, InventorySessionDto, InventorySessionDetailDto } from '../types/warehouse';
import type { PaginatedResult } from '../types/common';

export const getWarehouses = (params?: { page?: number; pageSize?: number; type?: number }) =>
  apiClient.get<PaginatedResult<WarehouseDto>>('/api/warehouses', { params }).then((r) => r.data);

export const getWarehouseItems = (params?: { page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<WarehouseItemDto>>('/api/warehouses/items', { params }).then((r) => r.data);

export const getWarehouseItemsByCategory = (category: string) => {
  const CATEGORY_PAGE_SIZE = 200;
  return apiClient
    .get<PaginatedResult<WarehouseItemDto>>('/api/warehouses/items', {
      params: { category, pageSize: CATEGORY_PAGE_SIZE },
    })
    .then((r) => r.data);
};

export const getBalances = (params?: { warehouseId?: string; itemId?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<BalanceDto>>('/api/warehouses/balances', { params }).then((r) => r.data);

export const createWarehouse = (data: { name: string; location?: string; type?: number }) =>
  apiClient.post<{ id: string }>('/api/warehouses', data).then((r) => r.data);

export const createWarehouseItem = (data: { name: string; code: string; category: string; baseUnit: string; description?: string; minimumQuantity?: number; purchasePrice?: number }) =>
  apiClient.post<WarehouseItemDto>('/api/warehouses/items', data).then((r) => r.data);

export const updateWarehouseItem = (id: string, data: { name: string; code: string; category: string; baseUnit: string; description?: string; minimumQuantity?: number; purchasePrice?: number }) =>
  apiClient.put<void>(`/api/warehouses/items/${id}`, data).then((r) => r.data);

export const createReceipt = (data: {
  warehouseId: string;
  itemId: string;
  unitCode: string;
  quantity: number;
  pricePerUnit?: number;
  note?: string;
  batchCode?: string;
}) =>
  apiClient.post('/api/warehouses/receipt', data).then((r) => r.data);

export const createIssue = (data: {
  warehouseId: string;
  itemId: string;
  unitCode: string;
  quantity: number;
  fieldId?: string;
  agroOperationId?: string;
  note?: string;
}) =>
  apiClient.post('/api/warehouses/issue', data).then((r) => r.data);

export const createTransfer = (data: {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  itemId: string;
  unitCode: string;
  quantity: number;
  note?: string;
}) =>
  apiClient.post('/api/warehouses/transfer', data).then((r) => r.data);

export const getStockMovements = (params?: {
  warehouseId?: string;
  itemId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<PaginatedResult<StockMoveDto>>('/api/warehouses/moves', { params }).then((r) => r.data);

export const getItemCategories = () =>
  apiClient.get<ItemCategoryDto[]>('/api/warehouses/item-categories').then((r) => r.data);

export const createItemCategory = (data: { name: string; code?: string; parentId?: string }) =>
  apiClient.post<{ id: string }>('/api/warehouses/item-categories', data).then((r) => r.data);

export const getInventorySessions = (params?: { warehouseId?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<InventorySessionDto>>('/api/inventory-sessions', { params }).then((r) => r.data);

export const getInventorySessionById = (id: string) =>
  apiClient.get<InventorySessionDetailDto>(`/api/inventory-sessions/${id}`).then((r) => r.data);

export const startInventorySession = (data: { warehouseId: string; notes?: string }) =>
  apiClient.post<{ id: string }>('/api/inventory-sessions', data).then((r) => r.data);

export const recordInventoryCount = (sessionId: string, data: { itemId: string; batchId?: string; actualQuantity: number; note?: string }) =>
  apiClient.post<void>(`/api/inventory-sessions/${sessionId}/count`, data).then((r) => r.data);

export const submitInventorySession = (id: string) =>
  apiClient.post<void>(`/api/inventory-sessions/${id}/submit`).then((r) => r.data);

export const approveInventorySession = (id: string) =>
  apiClient.post<void>(`/api/inventory-sessions/${id}/approve`).then((r) => r.data);

export const completeInventorySession = (id: string) =>
  apiClient.post<void>(`/api/inventory-sessions/${id}/complete`).then((r) => r.data);

// ── Import ──────────────────────────────────────────────────────────────────
export interface ImportPreviewRow {
  rowNumber: number;
  name: string;
  code: string;
  category: string;
  baseUnit: string;
  isValid: boolean;
  error?: string;
}

export const uploadImportFile = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post<ImportPreviewRow[]>('/api/warehouses/items/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const confirmImport = (rows: ImportPreviewRow[]) =>
  apiClient.post<{ created: number }>('/api/warehouses/items/import/confirm', { rows }).then((r) => r.data);
