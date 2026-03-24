export interface AuditLogDto {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  metadata?: string;
}
