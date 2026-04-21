using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Fields.DTOs;

public class CropHistoryDto
{
    public Guid Id { get; set; }
    public Guid FieldId { get; set; }
    public CropType Crop { get; set; }
    public int Year { get; set; }
    public decimal? YieldPerHectare { get; set; }
    public string? Notes { get; set; }
}
