using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.WriteOffGrainBatch;

public record WriteOffGrainBatchCommand(
    Guid BatchId,
    decimal QuantityTons,
    string? Reason = null,
    string? Notes = null,
    DateTime? MovementDate = null
) : IRequest<Guid>;
