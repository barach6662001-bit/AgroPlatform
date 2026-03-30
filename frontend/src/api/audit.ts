import axios from './axios';
import type { AuditLogDto } from '../types/audit';
import type { PaginatedResult } from '../types/common';

export interface AuditEntryDto {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  createdAtUtc: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: string;
  newValues?: string;
  affectedColumns?: string[];
  ipAddress?: string;
  notes?: string;
}

export interface AuditLogResultDto {
  entries: AuditEntryDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export async function getAuditLog(
  entityType?: string,
  userId?: string,
  fromDate?: Date,
  toDate?: Date,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<AuditLogResultDto> {
  const params = new URLSearchParams();
  if (entityType) params.append('entityType', entityType);
  if (userId) params.append('userId', userId);
  if (fromDate) params.append('fromDate', fromDate.toISOString());
  if (toDate) params.append('toDate', toDate.toISOString());
  params.append('pageNumber', pageNumber.toString());
  params.append('pageSize', pageSize.toString());

  const response = await axios.get(`/api/audit?${params.toString()}`);
  const data = response.data as PaginatedResult<AuditLogDto>;

  // Backward-compatible shape for Admin/AuditLogPage
  return {
    entries: (data.items ?? []).map((item) => ({
      id: item.id,
      tenantId: '',
      userId: item.userId ?? '',
      userEmail: item.userId ?? 'unknown',
      createdAtUtc: item.timestamp,
      entityType: item.entityType,
      entityId: item.entityId,
      action: item.action,
      oldValues: item.oldValues,
      newValues: item.newValues,
      affectedColumns: item.affectedColumns,
      ipAddress: undefined,
      notes: item.notes,
    })),
    total: data.totalCount ?? 0,
    pageNumber: data.page ?? pageNumber,
    pageSize: data.pageSize ?? pageSize,
  } as AuditLogResultDto;
}
export const getAuditLogs = (params?: {
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  entityType?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}) =>
  axios
    .get<PaginatedResult<AuditLogDto>>('/api/audit', { params })
    .then((r) => r.data);
