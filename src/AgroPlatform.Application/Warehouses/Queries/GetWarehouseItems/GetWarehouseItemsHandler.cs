using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.GetWarehouseItems;

public class GetWarehouseItemsHandler : IRequestHandler<GetWarehouseItemsQuery, List<WarehouseItemDto>>
{
    private readonly IAppDbContext _context;

    public GetWarehouseItemsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<WarehouseItemDto>> Handle(GetWarehouseItemsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.WarehouseItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(i => i.Category == request.Category);

        return await query
            .Select(i => new WarehouseItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Code = i.Code,
                Category = i.Category,
                BaseUnit = i.BaseUnit,
                Description = i.Description
            })
            .ToListAsync(cancellationToken);
    }
}
