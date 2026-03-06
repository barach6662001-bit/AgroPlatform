import apiClient from './axios';
import type { WarehouseDto, WarehouseItemDto, BalanceDto } from '../types/warehouse';

export const getWarehouses = () =>
  apiClient.get<WarehouseDto[]>('/api/warehouses').then((r) => r.data);

export const getWarehouseItems = () =>
  apiClient.get<WarehouseItemDto[]>('/api/warehouses/items').then((r) => r.data);

export const getBalances = (params?: { warehouseId?: string; itemId?: string }) =>
  apiClient.get<BalanceDto[]>('/api/warehouses/balances', { params }).then((r) => r.data);
