using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.GrainStorage.DTOs;

public class GrainBatchDto
{
    public Guid Id { get; set; }
    public Guid GrainStorageId { get; set; }
    public string GrainType { get; set; } = string.Empty;
    public decimal QuantityTons { get; set; }
    public decimal InitialQuantityTons { get; set; }
    public GrainOwnershipType OwnershipType { get; set; }
    public string? OwnerName { get; set; }
    public string? ContractNumber { get; set; }
    public decimal? PricePerTon { get; set; }
    public DateTime ReceivedDate { get; set; }
    public Guid? SourceFieldId { get; set; }
    public string? SourceFieldName { get; set; }
    public decimal? MoisturePercent { get; set; }
    public string? Notes { get; set; }
}
