import apiClient from './axios';

export interface AdminTenant {
  id: string;
  name: string;
  edrpou?: string | null;
  plan: string;
  userCount: number;
  fieldCount: number;
  totalHectares: number;
  status: 'active' | 'suspended' | string;
  createdAt: string;
  lastActiveAt: string | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminFeature {
  key: string;
  isEnabled: boolean;
}

export const listAdminTenants = (params: { search?: string; page?: number; pageSize?: number } = {}) =>
  apiClient
    .get<PagedResult<AdminTenant>>('/api/admin/tenants', { params })
    .then((r) => r.data);

export const getAdminTenant = (id: string) =>
  apiClient.get<AdminTenant>(`/api/admin/tenants/${id}`).then((r) => r.data);

export const getAdminTenantFeatures = (id: string) =>
  apiClient
    .get<{ features: AdminFeature[] }>(`/api/admin/tenants/${id}/features`)
    .then((r) => r.data.features);

export const updateAdminTenantFeatures = (
  id: string,
  features: { key: string; isEnabled: boolean }[],
) =>
  apiClient
    .put<{ features: AdminFeature[] }>(`/api/admin/tenants/${id}/features`, { features })
    .then((r) => r.data.features);
