using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Notifications;

public class Notification : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string Type { get; set; } = string.Empty;   // "info" | "warning" | "error"
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
