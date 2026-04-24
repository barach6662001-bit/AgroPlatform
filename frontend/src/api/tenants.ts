import apiClient from './axios';

export interface TenantDto {
  id: string;
  name: string;
  inn?: string;
  isActive: boolean;
  createdAtUtc: string;
  companyName?: string;
  edrpou?: string;
  address?: string;
  phone?: string;
}

export interface UpdateTenantRequest {
  companyName?: string;
  edrpou?: string;
  address?: string;
  phone?: string;
}

export interface TenantDataBoundariesDto {
  minOperationDate: string | null;
  maxOperationDate: string | null;
}

export interface SeasonDto {
  id: string;
  code: string;
  name: string;
  startDate: string; // ISO date (YYYY-MM-DD)
  endDate: string;
  isCurrent: boolean;
}

export const getTenants = () =>
  apiClient.get<TenantDto[]>('/api/tenants').then((r) => r.data);

export const getCurrentTenant = () =>
  apiClient.get<TenantDto>('/api/tenants/current').then((r) => r.data);

export const updateCurrentTenant = (data: UpdateTenantRequest) =>
  apiClient.put<TenantDto>('/api/tenants/current', data).then((r) => r.data);

export const getTenantDataBoundaries = () =>
  apiClient.get<TenantDataBoundariesDto>('/api/tenant/data-boundaries').then((r) => r.data);

export const getSeasons = () =>
  apiClient.get<SeasonDto[]>('/api/seasons').then((r) => r.data);
