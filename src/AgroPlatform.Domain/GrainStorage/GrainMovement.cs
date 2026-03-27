using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.GrainStorage;

public class GrainMovement : AuditableEntity
{
    public Guid GrainBatchId { get; set; }
    public GrainBatch GrainBatch { get; set; } = null!;
    public string MovementType { get; set; } = string.Empty;
    public decimal QuantityTons { get; set; }
    public DateTime MovementDate { get; set; }
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public decimal? PricePerTon { get; set; }
    public decimal? TotalRevenue { get; set; }
    public string? BuyerName { get; set; }

    /// <summary>Links this movement to a GrainTransfer record when the movement was created by a transfer operation.</summary>
    public Guid? GrainTransferId { get; set; }
    public GrainTransfer? GrainTransfer { get; set; }
}
