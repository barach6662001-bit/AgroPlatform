import apiClient from './axios';
import type { DashboardDto, ResourceConsumptionDto, FieldEfficiencyDto, FuelAnalyticsDto } from '../types/analytics';

export const getDashboard = () =>
  apiClient.get<DashboardDto>('/api/analytics/dashboard').then((r) => r.data);

export const getResourceConsumption = (params?: { from?: string; to?: string }) =>
  apiClient.get<ResourceConsumptionDto[]>('/api/analytics/resource-consumption', { params }).then((r) => r.data);

export const getFieldEfficiency = () =>
  apiClient.get<FieldEfficiencyDto[]>('/api/analytics/field-efficiency').then((r) => r.data);

export const getFuelAnalytics = () =>
  apiClient.get<FuelAnalyticsDto>('/api/analytics/fuel').then((r) => r.data);
