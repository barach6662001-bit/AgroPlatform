using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.GrainStorage.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainLedger;

public class GetGrainLedgerHandler : IRequestHandler<GetGrainLedgerQuery, PaginatedResult<GrainMovementDto>>
{
    private readonly IAppDbContext _context;

    public GetGrainLedgerHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<GrainMovementDto>> Handle(GetGrainLedgerQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GrainMovements
            .Include(m => m.GrainBatch).ThenInclude(b => b.Placements).ThenInclude(p => p.GrainStorage)
            .Include(m => m.SourceStorage)
            .Include(m => m.TargetStorage)
            .AsQueryable();

        if (request.StorageId.HasValue)
            query = query.Where(m => m.GrainBatch.Placements.Any(p => p.GrainStorageId == request.StorageId.Value));

        if (request.BatchId.HasValue)
            query = query.Where(m => m.GrainBatchId == request.BatchId.Value);

        if (!string.IsNullOrWhiteSpace(request.MovementType) &&
            Enum.TryParse<GrainMovementType>(request.MovementType, ignoreCase: true, out var type))
        {
            query = query.Where(m => m.MovementType == type);
        }

        if (request.DateFrom.HasValue)
            query = query.Where(m => m.MovementDate >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(m => m.MovementDate <= request.DateTo.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(m => m.MovementDate)
            .ThenByDescending(m => m.CreatedAtUtc)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
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

        return new PaginatedResult<GrainMovementDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
        };
    }
}
