import axios from './axios';

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
  return response.data;
}
