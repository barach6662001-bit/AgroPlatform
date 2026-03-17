using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;

public record CreateGrainBatchCommand(
    Guid GrainStorageId,
    string GrainType,
    decimal QuantityTons,
    GrainOwnershipType OwnershipType,
    string? OwnerName,
    string? ContractNumber,
    decimal? PricePerTon,
    DateTime ReceivedDate,
    string? Notes
) : IRequest<Guid>;
