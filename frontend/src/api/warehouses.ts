import apiClient from './axios';
import type { WarehouseDto, WarehouseItemDto, BalanceDto } from '../types/warehouse';
import type { PaginatedResult } from '../types/common';

export const getWarehouses = (params?: { page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<WarehouseDto>>('/api/warehouses', { params }).then((r) => r.data);

export const getWarehouseItems = (params?: { page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<WarehouseItemDto>>('/api/warehouses/items', { params }).then((r) => r.data);

export const getBalances = (params?: { warehouseId?: string; itemId?: string; page?: number; pageSize?: number }) =>
  apiClient.get<PaginatedResult<BalanceDto>>('/api/warehouses/balances', { params }).then((r) => r.data);

export const createWarehouse = (data: { name: string; location?: string }) =>
  apiClient.post<WarehouseDto>('/api/warehouses', data).then((r) => r.data);

export const createWarehouseItem = (data: { name: string; code: string; category: string; baseUnit: string; description?: string }) =>
  apiClient.post<WarehouseItemDto>('/api/warehouses/items', data).then((r) => r.data);

export const createReceipt = (data: {
  warehouseId: string;
  itemId: string;
  quantity: number;
  date: string;
  batchCode?: string;
  notes?: string;
}) =>
  apiClient.post('/api/warehouses/receipt', data).then((r) => r.data);

export const createIssue = (data: {
  warehouseId: string;
  itemId: string;
  quantity: number;
  date: string;
  notes?: string;
}) =>
  apiClient.post('/api/warehouses/issue', data).then((r) => r.data);

export const createTransfer = (data: {
  fromWarehouseId: string;
  toWarehouseId: string;
  itemId: string;
  quantity: number;
  date: string;
  notes?: string;
}) =>
  apiClient.post('/api/warehouses/transfer', data).then((r) => r.data);
