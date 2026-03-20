using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;

public record CreateGrainMovementCommand(
    Guid GrainBatchId,
    string MovementType,
    decimal QuantityTons,
    DateTime MovementDate,
    string? Reason,
    string? Notes,
    decimal? PricePerTon = null,
    string? BuyerName = null
) : IRequest<Guid>;
