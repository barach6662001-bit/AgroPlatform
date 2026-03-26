using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.AddGrainBatchPlacement;

public record AddGrainBatchPlacementCommand(
    Guid GrainBatchId,
    Guid GrainStorageId,
    Guid? GrainStorageUnitId,
    decimal QuantityTons
) : IRequest<Guid>;
