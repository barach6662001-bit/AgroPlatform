import apiClient from './axios';
import type { CostRecordDto } from '../types/economics';

export const getCostRecords = (params?: {
  fieldId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}) =>
  apiClient.get<CostRecordDto[]>('/api/economics/cost-records', { params }).then((r) => r.data);
