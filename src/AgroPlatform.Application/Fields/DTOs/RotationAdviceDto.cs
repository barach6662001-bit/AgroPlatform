namespace AgroPlatform.Application.Fields.DTOs;

public class RotationAdviceDto
{
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public List<string> CropHistory { get; set; } = [];
    public string RiskLevel { get; set; } = "low";
    public string Recommendation { get; set; } = string.Empty;
}
