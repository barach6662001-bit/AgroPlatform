using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.TransferGrain;

public record TransferGrainCommand(
    Guid SourceBatchId,
    Guid TargetBatchId,
    decimal QuantityTons,
    DateTime? MovementDate = null,
    string? Notes = null,
    string? ClientOperationId = null
) : IRequest<Guid>;
