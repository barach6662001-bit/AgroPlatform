export interface AuditLogDto {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  oldValues?: string;
  newValues?: string;
  affectedColumns: string[];
  notes?: string;
  metadata?: string;
}
