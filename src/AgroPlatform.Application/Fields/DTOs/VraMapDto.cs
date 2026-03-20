namespace AgroPlatform.Application.Fields.DTOs;

public class VraMapDto
{
    public Guid Id { get; set; }
    public Guid FieldId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FertilizerName { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public List<VraZoneDto> Zones { get; set; } = new();
}
