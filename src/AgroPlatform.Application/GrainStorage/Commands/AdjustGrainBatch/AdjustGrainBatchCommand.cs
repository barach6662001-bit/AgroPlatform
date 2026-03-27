using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.AdjustGrainBatch;

/// <summary>Records an inventory adjustment on a grain batch. <see cref="AdjustmentTons"/> is signed: positive = increase, negative = decrease.</summary>
public record AdjustGrainBatchCommand(
    Guid BatchId,
    decimal AdjustmentTons,
    string? Reason = null,
    string? Notes = null,
    DateTime? MovementDate = null
) : IRequest<Guid>;
