using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.GetInventorySessions;

public class GetInventorySessionsHandler : IRequestHandler<GetInventorySessionsQuery, PaginatedResult<InventorySessionDto>>
{
    private readonly IAppDbContext _context;

    public GetInventorySessionsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<InventorySessionDto>> Handle(GetInventorySessionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.InventorySessions
            .Include(s => s.Warehouse)
            .Include(s => s.Lines)
            .AsQueryable();

        if (request.WarehouseId.HasValue)
            query = query.Where(s => s.WarehouseId == request.WarehouseId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new InventorySessionDto
            {
                Id = s.Id,
                WarehouseId = s.WarehouseId,
                WarehouseName = s.Warehouse.Name,
                Status = s.Status,
                Notes = s.Notes,
                CreatedAtUtc = s.CreatedAtUtc,
                CompletedAtUtc = s.CompletedAtUtc,
                TotalLines = s.Lines.Count,
                CountedLines = s.Lines.Count(l => l.IsCountRecorded)
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<InventorySessionDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
