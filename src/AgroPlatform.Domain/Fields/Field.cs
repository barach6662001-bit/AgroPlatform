using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Fields;

public class Field : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? CadastralNumber { get; set; }
    public decimal AreaHectares { get; set; }
    public CropType? CurrentCrop { get; set; }
    public int? CurrentCropYear { get; set; }
    public string? GeoJson { get; set; }
    public string? SoilType { get; set; }
    public string? Notes { get; set; }

    public ICollection<FieldCropHistory> CropHistory { get; set; } = new List<FieldCropHistory>();
    public ICollection<AgroOperation> Operations { get; set; } = new List<AgroOperation>();
    public ICollection<CropRotationPlan> RotationPlans { get; set; } = new List<CropRotationPlan>();
}
