import apiClient from './axios';
import type { DashboardDto, ResourceConsumptionDto, FieldEfficiencyDto, SalaryFuelAnalyticsDto } from '../types/analytics';
import type { MarginalitySummaryDto } from '../types/economics';

export const getDashboard = (
  params?: { from?: string; to?: string },
  signal?: AbortSignal,
) =>
  apiClient
    .get<DashboardDto>('/api/analytics/dashboard', { params, signal })
    .then((r) => r.data);

export const getResourceConsumption = (params?: { from?: string; to?: string }) =>
  apiClient.get<ResourceConsumptionDto[]>('/api/analytics/resource-consumption', { params }).then((r) => r.data);

export const getFieldEfficiency = () =>
  apiClient.get<FieldEfficiencyDto[]>('/api/analytics/field-efficiency').then((r) => r.data);

export const getAnalyticsMarginality = (params?: { year?: number }) =>
  apiClient.get<MarginalitySummaryDto>('/api/analytics/marginality', { params }).then((r) => r.data);

export const getSalaryFuelAnalytics = (params?: { year?: number }) =>
  apiClient.get<SalaryFuelAnalyticsDto>('/api/analytics/salary-fuel', { params }).then((r) => r.data);
