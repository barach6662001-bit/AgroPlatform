import apiClient from './axios';
import type { DashboardDto, ResourceConsumptionDto, FieldEfficiencyDto, ResourceEfficiencyDto } from '../types/analytics';
import type { MarginalitySummaryDto } from '../types/economics';

export const getDashboard = () =>
  apiClient.get<DashboardDto>('/api/analytics/dashboard').then((r) => r.data);

export const getResourceConsumption = (params?: { from?: string; to?: string }) =>
  apiClient.get<ResourceConsumptionDto[]>('/api/analytics/resource-consumption', { params }).then((r) => r.data);

export const getFieldEfficiency = () =>
  apiClient.get<FieldEfficiencyDto[]>('/api/analytics/field-efficiency').then((r) => r.data);

export const getAnalyticsMarginality = (params?: { year?: number }) =>
  apiClient.get<MarginalitySummaryDto>('/api/analytics/marginality', { params }).then((r) => r.data);

export const getResourceEfficiency = (params?: { year?: number }) =>
  apiClient.get<ResourceEfficiencyDto>('/api/analytics/resource-efficiency', { params }).then((r) => r.data);
