using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Notifications;

public class MobilePushToken : AuditableEntity
{
    public string UserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty; // "ios" | "android"
    public bool IsActive { get; set; } = true;
    public DateTime LastUsedAtUtc { get; set; } = DateTime.UtcNow;
}
