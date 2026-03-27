using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.GrainStorage;

/// <summary>
/// Represents the physical placement of a portion of a grain batch in a specific grain storage facility.
/// One grain batch can be distributed across multiple storages via multiple placements.
/// </summary>
public class GrainBatchPlacement : AuditableEntity
{
    public Guid GrainBatchId { get; set; }
    public Guid GrainStorageId { get; set; }
    public Guid? GrainStorageUnitId { get; set; }
    public decimal QuantityTons { get; set; }

    public GrainBatch GrainBatch { get; set; } = null!;
    public GrainStorage GrainStorage { get; set; } = null!;
}
