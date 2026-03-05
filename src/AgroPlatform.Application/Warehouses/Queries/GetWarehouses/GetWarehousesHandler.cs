using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.GetWarehouses;

public class GetWarehousesHandler : IRequestHandler<GetWarehousesQuery, List<WarehouseDto>>
{
    private readonly IAppDbContext _context;

    public GetWarehousesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<WarehouseDto>> Handle(GetWarehousesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Warehouses
            .Where(w => !w.IsDeleted)
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Location = w.Location,
                IsActive = w.IsActive
            })
            .ToListAsync(cancellationToken);
    }
}
