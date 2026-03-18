namespace AgroPlatform.Application.GrainStorage.DTOs;

public class GrainSummaryDto
{
    public string GrainType { get; set; } = string.Empty;
    public decimal TotalTons { get; set; }
    public int BatchCount { get; set; }
}
