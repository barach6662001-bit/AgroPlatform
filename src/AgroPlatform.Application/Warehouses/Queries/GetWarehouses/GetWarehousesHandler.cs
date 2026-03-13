using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Warehouses.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.GetWarehouses;

public class GetWarehousesHandler : IRequestHandler<GetWarehousesQuery, PaginatedResult<WarehouseDto>>
{
    private readonly IAppDbContext _context;

    public GetWarehousesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<WarehouseDto>> Handle(GetWarehousesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Warehouses.Where(w => !w.IsDeleted);
        if (request.Type.HasValue)
            query = query.Where(w => w.Type == request.Type.Value);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(w => w.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Location = w.Location,
                IsActive = w.IsActive,
                Type = w.Type
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<WarehouseDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
