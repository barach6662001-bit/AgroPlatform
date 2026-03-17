using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.GrainStorage;

public class GrainType : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
