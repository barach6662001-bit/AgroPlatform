using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainMovements;

public class GetGrainMovementsHandler : IRequestHandler<GetGrainMovementsQuery, List<GrainMovementDto>>
{
    private readonly IAppDbContext _context;

    public GetGrainMovementsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<GrainMovementDto>> Handle(GetGrainMovementsQuery request, CancellationToken cancellationToken)
    {
        return await _context.GrainMovements
            .Where(m => m.GrainBatchId == request.BatchId)
            .Include(m => m.GrainBatch).ThenInclude(b => b.Placements).ThenInclude(p => p.GrainStorage)
            .Include(m => m.SourceStorage)
            .Include(m => m.TargetStorage)
            .OrderByDescending(m => m.MovementDate)
            .Select(m => new GrainMovementDto
            {
                Id = m.Id,
                GrainBatchId = m.GrainBatchId,
                GrainType = m.GrainBatch.GrainType,
                StorageName = m.GrainBatch.Placements.Select(p => p.GrainStorage.Name).FirstOrDefault() ?? string.Empty,
                MovementType = m.MovementType.ToString(),
                QuantityTons = m.QuantityTons,
                MovementDate = m.MovementDate,
                OperationId = m.OperationId,
                SourceStorageId = m.SourceStorageId,
                SourceStorageName = m.SourceStorage != null ? m.SourceStorage.Name : null,
                TargetStorageId = m.TargetStorageId,
                TargetStorageName = m.TargetStorage != null ? m.TargetStorage.Name : null,
                SourceBatchId = m.SourceBatchId,
                TargetBatchId = m.TargetBatchId,
                Reason = m.Reason,
                Notes = m.Notes,
                PricePerTon = m.PricePerTon,
                TotalRevenue = m.TotalRevenue,
                BuyerName = m.BuyerName,
                CreatedBy = m.CreatedBy,
                CreatedAtUtc = m.CreatedAtUtc,
            })
            .ToListAsync(cancellationToken);
    }
}
