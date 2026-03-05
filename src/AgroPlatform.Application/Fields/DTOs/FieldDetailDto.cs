namespace AgroPlatform.Application.Fields.DTOs;

public class FieldDetailDto : FieldDto
{
    public string? GeoJson { get; set; }
    public List<CropHistoryDto> CropHistory { get; set; } = new();
    public List<CropRotationPlanDto> RotationPlans { get; set; } = new();
}
