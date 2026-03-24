using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class FieldInspection : AuditableEntity
{
    public Guid FieldId { get; set; }
    public Field Field { get; set; } = null!;

    public DateTime Date { get; set; }
    public string InspectorName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Severity { get; set; }

    // Optional location metadata
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Optional photo metadata (URL or filename – no binary storage)
    public string? PhotoUrl { get; set; }
}
