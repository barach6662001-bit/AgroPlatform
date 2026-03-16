import apiClient from './axios';
import type { FuelTankDto, FuelTransactionDto } from '../types/fuel';
import type { PaginatedResult } from '../types/common';

export const getFuelTanks = () =>
  apiClient.get<FuelTankDto[]>('/api/fuel/tanks').then((r) => r.data);

export const createFuelTank = (data: {
  name: string;
  fuelType: number;
  capacityLiters: number;
  pricePerLiter?: number;
}) =>
  apiClient.post<{ id: string }>('/api/fuel/tanks', data).then((r) => r.data);

export const createFuelSupply = (data: {
  fuelTankId: string;
  quantityLiters: number;
  pricePerLiter?: number;
  transactionDate: string;
  supplierName?: string;
  invoiceNumber?: string;
  notes?: string;
}) =>
  apiClient.post<{ id: string }>('/api/fuel/supply', data).then((r) => r.data);

export const createFuelIssue = (data: {
  fuelTankId: string;
  quantityLiters: number;
  pricePerLiter?: number;
  transactionDate: string;
  machineId?: string;
  driverName?: string;
  notes?: string;
}) =>
  apiClient.post<{ id: string }>('/api/fuel/issue', data).then((r) => r.data);

export const getFuelTransactions = (params?: {
  tankId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient
    .get<PaginatedResult<FuelTransactionDto>>('/api/fuel/transactions', { params })
    .then((r) => r.data);
