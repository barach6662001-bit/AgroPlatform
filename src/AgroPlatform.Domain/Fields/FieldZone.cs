using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class FieldZone : AuditableEntity
{
    public Guid FieldId { get; set; }
    public Field Field { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string? GeoJson { get; set; }
    public string? SoilType { get; set; }
    public string? Notes { get; set; }
}
