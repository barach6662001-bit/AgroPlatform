using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Fields.DTOs;

public class FieldDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CadastralNumber { get; set; }
    public decimal AreaHectares { get; set; }
    public CropType? CurrentCrop { get; set; }
    public int? CurrentCropYear { get; set; }
    public string? SoilType { get; set; }
    public string? Notes { get; set; }
    public int OwnershipType { get; set; }
}
