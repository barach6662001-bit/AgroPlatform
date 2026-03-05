using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Fields;

public class FieldCropHistory : AuditableEntity
{
    public Guid FieldId { get; set; }
    public CropType Crop { get; set; }
    public int Year { get; set; }
    public decimal? YieldPerHectare { get; set; }
    public string? Notes { get; set; }

    public Field Field { get; set; } = null!;
}
