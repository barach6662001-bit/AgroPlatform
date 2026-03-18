namespace AgroPlatform.Application.GrainStorage.DTOs;

public class GrainMovementDto
{
    public Guid Id { get; set; }
    public Guid GrainBatchId { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public decimal QuantityTons { get; set; }
    public DateTime MovementDate { get; set; }
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public decimal? PricePerTon { get; set; }
    public decimal? TotalRevenue { get; set; }
}
