using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainBatches;

public class GetGrainBatchesHandler : IRequestHandler<GetGrainBatchesQuery, PaginatedResult<GrainBatchDto>>
{
    private readonly IAppDbContext _context;

    public GetGrainBatchesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<GrainBatchDto>> Handle(GetGrainBatchesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GrainBatches.AsQueryable();

        if (request.StorageId.HasValue)
            query = query.Where(b => b.Placements.Any(p => p.GrainStorageId == request.StorageId.Value));

        if (request.OwnershipType.HasValue)
            query = query.Where(b => b.OwnershipType == request.OwnershipType.Value);

        if (request.MinQuantity.HasValue)
            query = query.Where(b => b.QuantityTons >= request.MinQuantity.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(b => b.ReceivedDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new GrainBatchDto
            {
                Id = b.Id,
                GrainType = b.GrainType,
                QuantityTons = b.QuantityTons,
                InitialQuantityTons = b.InitialQuantityTons,
                OwnershipType = b.OwnershipType,
                OwnerName = b.OwnerName,
                ContractNumber = b.ContractNumber,
                PricePerTon = b.PricePerTon,
                ReceivedDate = b.ReceivedDate,
                SourceFieldId = b.SourceFieldId,
                SourceFieldName = b.SourceFieldId != null
                    ? b.SourceField!.Name
                    : null,
                MoisturePercent = b.MoisturePercent,
                Notes = b.Notes,
                Placements = b.Placements
                    .Select(p => new GrainBatchPlacementDto
                    {
                        Id = p.Id,
                        GrainStorageId = p.GrainStorageId,
                        GrainStorageName = p.GrainStorage.Name,
                        GrainStorageUnitId = p.GrainStorageUnitId,
                        QuantityTons = p.QuantityTons,
                    })
                    .ToList(),
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<GrainBatchDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
        };
    }
}
