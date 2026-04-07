using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.AddGrainReceipt;

/// <summary>
/// Adds additional quantity to an existing grain batch (partial/staged receipt).
/// </summary>
public record AddGrainReceiptCommand(
    Guid GrainBatchId,
    Guid GrainStorageId,
    decimal QuantityTons,
    DateTime ReceivedDate,
    decimal? MoisturePercent,
    string? Notes,
    string? ClientOperationId
) : IRequest<Guid>;
