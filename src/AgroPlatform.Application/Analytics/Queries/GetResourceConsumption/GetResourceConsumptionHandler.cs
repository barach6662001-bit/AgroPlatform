using AgroPlatform.Application.Analytics.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Analytics.Queries.GetResourceConsumption;

public class GetResourceConsumptionHandler : IRequestHandler<GetResourceConsumptionQuery, List<ResourceConsumptionDto>>
{
    private readonly IAppDbContext _context;

    public GetResourceConsumptionHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ResourceConsumptionDto>> Handle(GetResourceConsumptionQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AgroOperationResources
            .Where(r => !r.IsDeleted)
            .AsQueryable();

        if (request.FieldId.HasValue)
            query = query.Where(r => r.AgroOperation.FieldId == request.FieldId.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(r => r.AgroOperation.PlannedDate >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(r => r.AgroOperation.PlannedDate <= request.DateTo.Value);

        return await query
            .GroupBy(r => new { r.WarehouseItemId, r.UnitCode })
            .Select(g => new
            {
                ItemId = g.Key.WarehouseItemId,
                UnitCode = g.Key.UnitCode,
                TotalConsumed = g.Sum(r => r.ActualQuantity ?? r.PlannedQuantity)
            })
            .Join(
                _context.WarehouseItems.Where(i => !i.IsDeleted),
                x => x.ItemId,
                i => i.Id,
                (x, i) => new ResourceConsumptionDto
                {
                    ItemId = x.ItemId,
                    ItemName = i.Name,
                    Category = i.Category,
                    TotalConsumed = x.TotalConsumed,
                    UnitCode = x.UnitCode
                })
            .OrderByDescending(d => d.TotalConsumed)
            .ToListAsync(cancellationToken);
    }
}
