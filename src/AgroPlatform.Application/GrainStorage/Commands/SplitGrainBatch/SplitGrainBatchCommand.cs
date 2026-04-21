using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;

/// <summary>Splits a grain batch: moves <see cref="SplitQuantityTons"/> into a new batch in <see cref="TargetStorageId"/>.</summary>
public record SplitGrainBatchCommand(
    Guid SourceBatchId,
    decimal SplitQuantityTons,
    Guid? TargetStorageId = null,
    string? Notes = null,
    DateTime? MovementDate = null,
    string? ClientOperationId = null
) : IRequest<Guid>;
