using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using System.ComponentModel.DataAnnotations;

namespace AgroPlatform.Domain.GrainStorage;

public class GrainBatch : AuditableEntity
{
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

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public ICollection<GrainMovement> Movements { get; set; } = new List<GrainMovement>();
    public ICollection<GrainBatchPlacement> Placements { get; set; } = new List<GrainBatchPlacement>();
    public Field? SourceField { get; set; }
}
