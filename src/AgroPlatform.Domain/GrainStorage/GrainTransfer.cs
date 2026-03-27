using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.GrainStorage;

/// <summary>
/// Records a grain transfer between two batches (possibly in different storage facilities).
/// Both the source "Out" movement and the target "In" movement reference this record.
/// </summary>
public class GrainTransfer : AuditableEntity
{
    public Guid SourceBatchId { get; set; }
    public GrainBatch SourceBatch { get; set; } = null!;

    public Guid TargetBatchId { get; set; }
    public GrainBatch TargetBatch { get; set; } = null!;

    public decimal QuantityTons { get; set; }
    public DateTime TransferDate { get; set; }
    public string? Notes { get; set; }
}
