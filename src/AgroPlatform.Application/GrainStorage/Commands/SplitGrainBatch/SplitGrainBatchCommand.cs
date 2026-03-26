using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;

public record SplitTarget(Guid TargetStorageId, decimal QuantityTons);

public record SplitGrainBatchCommand(
    Guid SourceBatchId,
    List<SplitTarget> Targets,
    string? Notes
) : IRequest<SplitGrainBatchResultDto>;
