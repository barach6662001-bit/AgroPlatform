import apiClient from './axios';
import type { SaleDto, SaleKpiDto, CropType, PaymentStatus } from '../types/sales';
import type { PaginatedResult } from '../types/common';

export const getSales = (params?: {
  buyerName?: string;
  cropType?: CropType;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<PaginatedResult<SaleDto>>('/api/sales', { params }).then((r) => r.data);

export const getSaleKpis = (params?: { dateFrom?: string; dateTo?: string }) =>
  apiClient.get<SaleKpiDto>('/api/sales/kpis', { params }).then((r) => r.data);

export const createSale = (data: {
  buyerName: string;
  contractNumber?: string;
  cropType: CropType;
  quantityTons: number;
  pricePerTon: number;
  saleDate: string;
  paymentStatus: PaymentStatus;
  grainBatchId?: string;
}) =>
  apiClient.post<{ id: string }>('/api/sales', data).then((r) => r.data);

export const updateSale = (id: string, data: {
  id: string;
  buyerName: string;
  contractNumber?: string;
  cropType: CropType;
  quantityTons: number;
  pricePerTon: number;
  saleDate: string;
  paymentStatus: PaymentStatus;
}) =>
  apiClient.put(`/api/sales/${id}`, data).then((r) => r.data);

export const deleteSale = (id: string) =>
  apiClient.delete(`/api/sales/${id}`);
