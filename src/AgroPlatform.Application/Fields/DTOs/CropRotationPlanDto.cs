using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Fields.DTOs;

public class CropRotationPlanDto
{
    public Guid Id { get; set; }
    public Guid FieldId { get; set; }
    public CropType PlannedCrop { get; set; }
    public int Year { get; set; }
    public string? Notes { get; set; }
}
