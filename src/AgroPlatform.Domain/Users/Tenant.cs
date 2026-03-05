using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Users;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Inn { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
