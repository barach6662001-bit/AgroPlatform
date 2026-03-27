using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.TransferGrain;

/// <summary>
/// Transfers grain from one batch to another (possibly in a different storage facility).
/// If <see cref="TargetBatchId"/> is null a new batch is created in <see cref="TargetStorageId"/>.
/// </summary>
public record TransferGrainCommand(
    Guid SourceBatchId,
    Guid? TargetBatchId,
    Guid? TargetStorageId,
    decimal QuantityTons,
    DateTime TransferDate,
    string? Notes
) : IRequest<Guid>;
