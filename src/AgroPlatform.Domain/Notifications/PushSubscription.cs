using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Notifications;

public class PushSubscription : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string Endpoint { get; set; } = string.Empty;
    public string? P256dhKey { get; set; }
    public string? AuthKey { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
