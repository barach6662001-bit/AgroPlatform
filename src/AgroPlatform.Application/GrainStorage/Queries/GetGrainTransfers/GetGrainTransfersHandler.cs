using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainTransfers;

public class GetGrainTransfersHandler : IRequestHandler<GetGrainTransfersQuery, IReadOnlyList<GrainTransferDto>>
{
    private readonly IAppDbContext _context;

    public GetGrainTransfersHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<GrainTransferDto>> Handle(GetGrainTransfersQuery request, CancellationToken cancellationToken)
    {
        var transfers = await _context.GrainTransfers
            .Include(t => t.SourceBatch).ThenInclude(b => b.GrainStorage)
            .Include(t => t.TargetBatch).ThenInclude(b => b.GrainStorage)
            .Where(t => t.SourceBatchId == request.BatchId || t.TargetBatchId == request.BatchId)
            .OrderByDescending(t => t.TransferDate)
            .ToListAsync(cancellationToken);

        return transfers.Select(t => new GrainTransferDto
        {
            Id = t.Id,
            SourceBatchId = t.SourceBatchId,
            SourceGrainType = t.SourceBatch.GrainType,
            SourceStorageName = t.SourceBatch.GrainStorage?.Name ?? string.Empty,
            TargetBatchId = t.TargetBatchId,
            TargetGrainType = t.TargetBatch.GrainType,
            TargetStorageName = t.TargetBatch.GrainStorage?.Name ?? string.Empty,
            QuantityTons = t.QuantityTons,
            TransferDate = t.TransferDate,
            Notes = t.Notes,
        }).ToList();
    }
}
