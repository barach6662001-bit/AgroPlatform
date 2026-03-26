using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.GrainStorage;

/// <summary>
/// Represents a physical grain storage facility (elevator, bin, flat storage, etc.).
/// Separate from material Warehouses which hold inventory items.
/// </summary>
public class GrainStorage : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Location { get; set; }
    public string? StorageType { get; set; }
    public decimal? CapacityTons { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }

    public ICollection<GrainBatch> GrainBatches { get; set; } = new List<GrainBatch>();
}
