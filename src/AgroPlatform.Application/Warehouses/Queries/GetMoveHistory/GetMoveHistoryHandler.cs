using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.GetMoveHistory;

public class GetMoveHistoryHandler : IRequestHandler<GetMoveHistoryQuery, List<MoveHistoryDto>>
{
    private readonly IAppDbContext _context;

    public GetMoveHistoryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MoveHistoryDto>> Handle(GetMoveHistoryQuery request, CancellationToken cancellationToken)
    {
        var query = _context.StockMoves
            .Include(m => m.Warehouse)
            .Include(m => m.Item)
            .Include(m => m.Batch)
            .AsQueryable();

        if (request.WarehouseId.HasValue)
            query = query.Where(m => m.WarehouseId == request.WarehouseId.Value);

        if (request.ItemId.HasValue)
            query = query.Where(m => m.ItemId == request.ItemId.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(m => m.CreatedAtUtc >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(m => m.CreatedAtUtc <= request.DateTo.Value);

        if (request.MoveType.HasValue)
            query = query.Where(m => m.MoveType == request.MoveType.Value);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        return await query
            .OrderByDescending(m => m.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MoveHistoryDto
            {
                Id = m.Id,
                WarehouseId = m.WarehouseId,
                WarehouseName = m.Warehouse.Name,
                ItemId = m.ItemId,
                ItemName = m.Item.Name,
                ItemCode = m.Item.Code,
                MoveType = m.MoveType,
                Quantity = m.Quantity,
                UnitCode = m.UnitCode,
                QuantityBase = m.QuantityBase,
                BatchId = m.BatchId,
                BatchCode = m.Batch != null ? m.Batch.Code : null,
                Note = m.Note,
                CreatedAtUtc = m.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);
    }
}
