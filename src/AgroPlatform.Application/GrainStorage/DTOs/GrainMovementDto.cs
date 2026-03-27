namespace AgroPlatform.Application.GrainStorage.DTOs;

public class GrainMovementDto
{
    public Guid Id { get; set; }
    public Guid GrainBatchId { get; set; }
    public string GrainType { get; set; } = string.Empty;
    public string StorageName { get; set; } = string.Empty;
    public string MovementType { get; set; } = string.Empty;
    public decimal QuantityTons { get; set; }
    public DateTime MovementDate { get; set; }
    public Guid? OperationId { get; set; }
    public Guid? SourceStorageId { get; set; }
    public string? SourceStorageName { get; set; }
    public Guid? TargetStorageId { get; set; }
    public string? TargetStorageName { get; set; }
    public Guid? SourceBatchId { get; set; }
    public Guid? TargetBatchId { get; set; }
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public decimal? PricePerTon { get; set; }
    public decimal? TotalRevenue { get; set; }
    public string? BuyerName { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
