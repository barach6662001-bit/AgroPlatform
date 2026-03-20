import apiClient from './axios';
import type { WarehouseDto, WarehouseItemDto, BalanceDto, StockMoveDto } from '../types/warehouse';
import type { PaginatedResult } from '../types/common';

export const getWarehouses = (params?: { page?: number; pageSize?: number; type?: number }) =>
  apiClient.get<PaginatedResult<WarehouseDto>>('/api/warehouses', { params }).then((r) => r.data);

export const getWarehouseItems = (params?: { page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<WarehouseItemDto>>('/api/warehouses/items', { params }).then((r) => r.data);

export const getBalances = (params?: { warehouseId?: string; itemId?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<BalanceDto>>('/api/warehouses/balances', { params }).then((r) => r.data);

export const createWarehouse = (data: { name: string; location?: string; type?: number }) =>
  apiClient.post<WarehouseDto>('/api/warehouses', data).then((r) => r.data);

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
