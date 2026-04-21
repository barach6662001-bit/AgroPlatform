import apiClient from './client';
import type { SaleDto, SalesAnalyticsDto } from '../types/sales';
import type { PaginatedResult } from '../types/common';

export const getSales = (params?: {
  buyerName?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<PaginatedResult<SaleDto>>('/api/sales', { params }).then((r) => r.data);

export const getSaleById = (id: string) =>
  apiClient.get<SaleDto>(`/api/sales/${id}`).then((r) => r.data);

export const createSale = (data: {
  date: string;
  buyerName: string;
  product: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  fieldId?: string;
  notes?: string;
}) =>
  apiClient.post<{ id: string }>('/api/sales', data).then((r) => r.data);

export const updateSale = (id: string, data: {
  id: string;
  date: string;
  buyerName: string;
  product: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  fieldId?: string;
  notes?: string;
}) =>
  apiClient.put(`/api/sales/${id}`, data);

export const deleteSale = (id: string) =>
  apiClient.delete(`/api/sales/${id}`);

export const getSalesAnalytics = (params?: { year?: number }) =>
  apiClient.get<SalesAnalyticsDto>('/api/sales/analytics', { params }).then((r) => r.data);
