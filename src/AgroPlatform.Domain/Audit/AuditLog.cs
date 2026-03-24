using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Audit;

public class AuditLog : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Metadata { get; set; }
}
