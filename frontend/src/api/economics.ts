import apiClient from './axios';
import type { CostRecordDto } from '../types/economics';
import type { PaginatedResult } from '../types/common';

export const getCostRecords = (params?: {
  fieldId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<PaginatedResult<CostRecordDto>>('/api/economics/cost-records', { params }).then((r) => r.data);

export const createCostRecord = (data: {
  category: string;
  amount: number;
  currency: string;
  date: string;
  fieldId?: string;
  agroOperationId?: string;
  description?: string;
}) =>
  apiClient.post<CostRecordDto>('/api/economics/cost-records', data).then((r) => r.data);

export const deleteCostRecord = (id: string) =>
  apiClient.delete(`/api/economics/cost-records/${id}`);
