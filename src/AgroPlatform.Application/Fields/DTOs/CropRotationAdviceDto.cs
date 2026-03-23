namespace AgroPlatform.Application.Fields.DTOs;

public class CropRotationAdviceDto
{
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public decimal AreaHectares { get; set; }
    public List<CropYearEntry> RecentCropHistory { get; set; } = new();
    public bool HasMonocultureRisk { get; set; }
    public string RiskLevel { get; set; } = "None";
    public string Recommendation { get; set; } = string.Empty;
    public string? SuggestedCrop { get; set; }
}

public class CropYearEntry
{
    public int Year { get; set; }
    public string Crop { get; set; } = string.Empty;
}
