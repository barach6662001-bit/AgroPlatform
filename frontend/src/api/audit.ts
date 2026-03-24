import apiClient from './axios';
import type { AuditLogDto } from '../types/audit';
import type { PaginatedResult } from '../types/common';

export const getAuditLogs = (params?: {
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  entityType?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient
    .get<PaginatedResult<AuditLogDto>>('/api/audit', { params })
    .then((r) => r.data);
