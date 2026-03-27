using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.TransferGrain;

public record TransferGrainCommand(
    Guid SourceBatchId,
    Guid TargetBatchId,
    decimal QuantityTons,
    DateTime? MovementDate = null,
    string? Notes = null
) : IRequest<Guid>;
