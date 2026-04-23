using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.FeatureFlags;

public class TenantFeatureFlag : ITenantEntity
{
    public Guid TenantId { get; set; }
    public string Key { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
}