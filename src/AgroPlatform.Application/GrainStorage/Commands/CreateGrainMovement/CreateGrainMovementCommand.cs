using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;

public record CreateGrainMovementCommand(
    Guid GrainBatchId,
    GrainMovementType MovementType,
    decimal QuantityTons,
    DateTime MovementDate,
    string? Reason,
    string? Notes,
    decimal? PricePerTon = null,
    string? BuyerName = null,
    string? ClientOperationId = null
) : IRequest<Guid>;
