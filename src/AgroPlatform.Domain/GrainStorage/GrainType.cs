using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.GrainStorage;

public class GrainType : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public Guid? TenantId { get; set; }
}
