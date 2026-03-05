using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Fields;

public class CropRotationPlan : AuditableEntity
{
    public Guid FieldId { get; set; }
    public int Year { get; set; }
    public CropType PlannedCrop { get; set; }
    public string? Notes { get; set; }

    public Field Field { get; set; } = null!;
}
