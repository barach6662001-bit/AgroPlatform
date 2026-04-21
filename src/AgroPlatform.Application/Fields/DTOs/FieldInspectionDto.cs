namespace AgroPlatform.Application.Fields.DTOs;

public class FieldInspectionDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string InspectorName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Severity { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? PhotoUrl { get; set; }
}
