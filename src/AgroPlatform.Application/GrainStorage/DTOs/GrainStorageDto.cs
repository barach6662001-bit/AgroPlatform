namespace AgroPlatform.Application.GrainStorage.DTOs;

public class GrainStorageDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Location { get; set; }
    public string? StorageType { get; set; }
    public decimal? CapacityTons { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
    public int BatchCount { get; set; }
    public decimal TotalTons { get; set; }
}
