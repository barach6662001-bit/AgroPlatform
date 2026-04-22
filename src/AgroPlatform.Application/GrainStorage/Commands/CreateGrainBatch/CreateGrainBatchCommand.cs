using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;

public record CreateGrainBatchCommand(
    Guid GrainStorageId,
    string GrainType,
    decimal InitialQuantityTons,
    GrainOwnershipType OwnershipType,
    string? OwnerName,
    string? ContractNumber,
    decimal? PricePerTon,
    DateTime ReceivedDate,
    Guid? SourceFieldId,
    decimal? MoisturePercent,
    string? Notes,
    decimal? ImpurityPercent = null,
    decimal? GrainImpurityPercent = null,
    decimal? ProteinPercent = null,
    decimal? GlutenPercent = null,
    int? NaturePerLiter = null,
    int? QualityClass = null
) : IRequest<Guid>;
