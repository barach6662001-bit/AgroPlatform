namespace AgroPlatform.Application.AuditLog.Queries.GetAuditLogs;

public class AuditLogDto
{
    public Guid Id { get; init; }
    public string? UserId { get; init; }
    public string Action { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public string EntityId { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public string? OldValues { get; init; }
    public string? NewValues { get; init; }
    public IReadOnlyList<string> AffectedColumns { get; init; } = Array.Empty<string>();
    public string? Notes { get; init; }
    public string? Metadata { get; init; }
}
