namespace AgroPlatform.Application.Fields.DTOs;

public class FieldZoneDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? GeoJson { get; set; }
    public string? SoilType { get; set; }
    public string? Notes { get; set; }
}
