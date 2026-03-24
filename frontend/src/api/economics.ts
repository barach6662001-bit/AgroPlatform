import apiClient from './axios';
import type {
  CostRecordDto,
  FieldPnlDto,
  BreakEvenDto,
  MarginalitySummaryDto,
  SeasonComparisonDto,
  EconomicsByCategoryDto,
  CostAnalyticsDto,
  CostSummaryDto,
} from '../types/economics';
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

export const getCostSummary = (params?: { category?: string; dateFrom?: string; dateTo?: string }) =>
  apiClient.get<CostSummaryDto>('/api/economics/cost-summary', { params }).then((r) => r.data);

export const getFieldPnl = (params?: {
  year?: number;
  estimatedPricePerTonne?: number;
  fieldId?: string;
}) =>
  apiClient.get<FieldPnlDto[]>('/api/economics/field-pnl', { params }).then((r) => r.data);

export const getMarginality = (params?: { year?: number }) =>
  apiClient.get<MarginalitySummaryDto>('/api/economics/marginality', { params }).then((r) => r.data);

export const getCostAnalytics = (params?: { year?: number }) =>
  apiClient.get<CostAnalyticsDto>('/api/economics/cost-analytics', { params }).then((r) => r.data);

export const getSeasonComparison = (years: number[]) =>
  apiClient
    .get<SeasonComparisonDto[]>('/api/economics/season-comparison', { params: { years: years.join(',') } })
    .then((r) => r.data);

export const getBreakEven = (params: { year?: number; pricePerTonne: number }) =>
  apiClient.get<BreakEvenDto[]>('/api/economics/break-even', { params }).then((r) => r.data);

// Re-export unified types for convenience
export type { EconomicsByCategoryDto as AnalyticsCategoryDto, CostAnalyticsDto, CostSummaryDto };
