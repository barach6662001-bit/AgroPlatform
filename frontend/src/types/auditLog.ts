export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  timestamp: string;
  metadata?: string;
}

export interface AuditLogsResponse {
  items: AuditLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AuditLogsParams {
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  entityType?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}
