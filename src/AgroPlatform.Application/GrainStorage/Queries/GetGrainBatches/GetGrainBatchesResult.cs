using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainBatches;

public class GrainBatchDto
{
    public Guid Id { get; init; }
    public Guid GrainStorageId { get; init; }
    public string GrainType { get; init; } = string.Empty;
    public decimal QuantityTons { get; init; }
    public decimal InitialQuantityTons { get; init; }
    public GrainOwnershipType OwnershipType { get; init; }
    public string? OwnerName { get; init; }
    public string? ContractNumber { get; init; }
    public decimal? PricePerTon { get; init; }
    public DateTime ReceivedDate { get; init; }
    public string? Notes { get; init; }
}

public class GetGrainBatchesResult
{
    public IReadOnlyList<GrainBatchDto> Items { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
}
