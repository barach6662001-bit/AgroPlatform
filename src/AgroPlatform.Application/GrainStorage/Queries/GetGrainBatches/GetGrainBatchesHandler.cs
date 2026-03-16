using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainBatches;

public class GetGrainBatchesHandler : IRequestHandler<GetGrainBatchesQuery, GetGrainBatchesResult>
{
    private readonly IAppDbContext _context;

    public GetGrainBatchesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<GetGrainBatchesResult> Handle(GetGrainBatchesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GrainBatches.AsQueryable();

        if (request.StorageId.HasValue)
            query = query.Where(b => b.GrainStorageId == request.StorageId.Value);

        if (request.OwnershipType.HasValue)
            query = query.Where(b => b.OwnershipType == request.OwnershipType.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(b => b.ReceivedDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new GrainBatchDto
            {
                Id = b.Id,
                GrainStorageId = b.GrainStorageId,
                GrainType = b.GrainType,
                QuantityTons = b.QuantityTons,
                InitialQuantityTons = b.InitialQuantityTons,
                OwnershipType = b.OwnershipType,
                OwnerName = b.OwnerName,
                ContractNumber = b.ContractNumber,
                PricePerTon = b.PricePerTon,
                ReceivedDate = b.ReceivedDate,
                Notes = b.Notes
            })
            .ToListAsync(cancellationToken);

        return new GetGrainBatchesResult
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
