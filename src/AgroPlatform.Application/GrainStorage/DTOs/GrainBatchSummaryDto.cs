using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.GrainStorage.DTOs;

public class GrainBatchSummaryDto
{
    public Guid Id { get; set; }
    public Guid GrainStorageId { get; set; }
    public string GrainType { get; set; } = string.Empty;
    public decimal QuantityTons { get; set; }
    public decimal InitialQuantityTons { get; set; }
    public GrainOwnershipType OwnershipType { get; set; }
    public string? OwnerName { get; set; }
    public DateTime ReceivedDate { get; set; }
    public decimal? MoisturePercent { get; set; }
    public decimal? ImpurityPercent { get; set; }
    public decimal? GrainImpurityPercent { get; set; }
    public decimal? ProteinPercent { get; set; }
    public decimal? GlutenPercent { get; set; }
    public int? NaturePerLiter { get; set; }
    public int? QualityClass { get; set; }
    public string? SourceFieldName { get; set; }
    public string? ContractNumber { get; set; }
}
