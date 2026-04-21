using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.GetWarehouseItems;

public class GetWarehouseItemsHandler : IRequestHandler<GetWarehouseItemsQuery, PaginatedResult<WarehouseItemDto>>
{
    private readonly IAppDbContext _context;

    public GetWarehouseItemsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<WarehouseItemDto>> Handle(GetWarehouseItemsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.WarehouseItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(i => i.Category == request.Category);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(i => i.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(i => new WarehouseItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Code = i.Code,
                Category = i.Category,
                BaseUnit = i.BaseUnit,
                Description = i.Description,
                PurchasePrice = i.PurchasePrice
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<WarehouseItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
