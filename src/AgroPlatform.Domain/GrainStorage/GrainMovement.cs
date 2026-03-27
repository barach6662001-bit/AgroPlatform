using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.GrainStorage;

public class GrainMovement : AuditableEntity
{
    public Guid GrainBatchId { get; set; }
    public GrainBatch GrainBatch { get; set; } = null!;
    public GrainMovementType MovementType { get; set; }
    public decimal QuantityTons { get; set; }
    public DateTime MovementDate { get; set; }

    /// <summary>Links related movements that form a single business operation (Transfer, Split, Merge).</summary>
    public Guid? OperationId { get; set; }

    /// <summary>Source grain storage placement (for Transfer / Split).</summary>
    public Guid? SourceStorageId { get; set; }
    public GrainStorage? SourceStorage { get; set; }

    /// <summary>Target grain storage placement (for Transfer / Split).</summary>
    public Guid? TargetStorageId { get; set; }
    public GrainStorage? TargetStorage { get; set; }

    /// <summary>The batch this movement originated from (for Transfer / Split / Merge).</summary>
    public Guid? SourceBatchId { get; set; }

    /// <summary>The batch this movement is directed to (for Transfer / Split / Merge).</summary>
    public Guid? TargetBatchId { get; set; }

    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public decimal? PricePerTon { get; set; }
    public decimal? TotalRevenue { get; set; }
    public string? BuyerName { get; set; }

    /// <summary>Links this movement to a GrainTransfer record when the movement was created by a transfer operation.</summary>
    public Guid? GrainTransferId { get; set; }
    public GrainTransfer? GrainTransfer { get; set; }
}
