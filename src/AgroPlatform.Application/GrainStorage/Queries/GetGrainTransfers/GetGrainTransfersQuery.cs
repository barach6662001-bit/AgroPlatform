using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainTransfers;

/// <summary>Returns transfer history for a specific batch (as source or target).</summary>
public record GetGrainTransfersQuery(Guid BatchId) : IRequest<IReadOnlyList<GrainTransferDto>>;
