using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;

namespace AgroPlatform.Domain.GrainStorage;

public class GrainBatch : AuditableEntity
{
    public Guid GrainStorageId { get; set; }
    public string GrainType { get; set; } = string.Empty;
    public decimal QuantityTons { get; set; }
    public decimal InitialQuantityTons { get; set; }
    public GrainOwnershipType OwnershipType { get; set; } = GrainOwnershipType.Own;
    public string? OwnerName { get; set; }
    public string? ContractNumber { get; set; }
    public decimal? PricePerTon { get; set; }
    public DateTime ReceivedDate { get; set; }
    public Guid? SourceFieldId { get; set; }
    public decimal? MoisturePercent { get; set; }
    public string? Notes { get; set; }

    public ICollection<GrainMovement> Movements { get; set; } = new List<GrainMovement>();
    public Field? SourceField { get; set; }
    public GrainStorage? GrainStorage { get; set; }
}
