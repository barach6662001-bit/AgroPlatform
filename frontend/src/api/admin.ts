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

// =============================================================================================
// Global users (PR #614). Returned by GET /api/admin/users.
// =============================================================================================
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  tenantId: string;
  tenantName: string;
}

export const listAdminUsers = (
  params: { search?: string; tenantId?: string; page?: number; pageSize?: number } = {},
) =>
  apiClient
    .get<PagedResult<AdminUser>>('/api/admin/users', { params })
    .then((r) => r.data);

// =============================================================================================
// Audit log (PR #614). Returned by GET /api/admin/audit-log.
// =============================================================================================
export interface SuperAdminAuditEntry {
  id: string;
  adminUserId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  before: string | null;
  after: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  occurredAt: string;
}

export const listAdminAuditLog = (
  params: {
    action?: string;
    adminUserId?: string;
    tenantId?: string;
    fromUtc?: string;
    toUtc?: string;
    page?: number;
    pageSize?: number;
  } = {},
) =>
  apiClient
    .get<PagedResult<SuperAdminAuditEntry>>('/api/admin/audit-log', { params })
    .then((r) => r.data);

// =============================================================================================
// Impersonation (PR #614).
// =============================================================================================
export interface ImpersonationStartResponse {
  token: string;
  expiresAtUtc: string;
  targetUserId: string;
  targetEmail: string;
  targetFirstName: string;
  targetLastName: string;
  targetTenantId: string;
  targetTenantName: string;
}

export interface ImpersonationEndResponse {
  token: string;
  expiresAtUtc: string;
}

export const startImpersonation = (targetUserId: string, reason: string) =>
  apiClient
    .post<ImpersonationStartResponse>('/api/admin/impersonate', { targetUserId, reason })
    .then((r) => r.data);

export const endImpersonation = () =>
  apiClient
    .post<ImpersonationEndResponse>('/api/admin/impersonate/end')
    .then((r) => r.data);
