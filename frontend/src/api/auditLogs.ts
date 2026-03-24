import apiClient from './axios';
import type { AuditLogsResponse, AuditLogsParams } from '../types/auditLog';

export const getAuditLogs = async (params: AuditLogsParams): Promise<AuditLogsResponse> => {
  const { data } = await apiClient.get<AuditLogsResponse>('/api/audit', { params });
  return data;
};
