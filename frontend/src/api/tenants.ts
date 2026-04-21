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

export const getTenants = () =>
  apiClient.get<TenantDto[]>('/api/tenants').then((r) => r.data);

export const getCurrentTenant = () =>
  apiClient.get<TenantDto>('/api/tenants/current').then((r) => r.data);

export const updateCurrentTenant = (data: UpdateTenantRequest) =>
  apiClient.put<TenantDto>('/api/tenants/current', data).then((r) => r.data);
