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
            .Where(b => b.WarehouseId == request.WarehouseId);

        if (request.ItemId.HasValue)
            query = query.Where(b => b.ItemId == request.ItemId.Value);

        return await query
            .Select(b => new BalanceDto
            {
                WarehouseId = b.WarehouseId,
                ItemId = b.ItemId,
                BatchId = b.BatchId,
                BalanceBase = b.BalanceBase,
                BaseUnit = b.BaseUnit,
                LastUpdatedUtc = b.LastUpdatedUtc
            })
            .ToListAsync(cancellationToken);
    }
}
