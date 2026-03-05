using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.GetBalance;

public class GetBalanceHandler : IRequestHandler<GetBalanceQuery, List<BalanceDto>>
{
    private readonly IAppDbContext _context;

    public GetBalanceHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BalanceDto>> Handle(GetBalanceQuery request, CancellationToken cancellationToken)
    {
        var query = _context.StockBalances
            .Include(b => b.Warehouse)
            .Include(b => b.Item)
            .Include(b => b.Batch)
            .AsQueryable();

        if (request.WarehouseId.HasValue)
            query = query.Where(b => b.WarehouseId == request.WarehouseId.Value);

        if (request.ItemId.HasValue)
            query = query.Where(b => b.ItemId == request.ItemId.Value);

        return await query
            .Select(b => new BalanceDto
            {
                WarehouseId = b.WarehouseId,
                WarehouseName = b.Warehouse.Name,
                ItemId = b.ItemId,
                ItemName = b.Item.Name,
                ItemCode = b.Item.Code,
                BatchId = b.BatchId,
                BatchCode = b.Batch != null ? b.Batch.Code : null,
                BalanceBase = b.BalanceBase,
                BaseUnit = b.BaseUnit,
                LastUpdatedUtc = b.LastUpdatedUtc
            })
            .ToListAsync(cancellationToken);
    }
}
