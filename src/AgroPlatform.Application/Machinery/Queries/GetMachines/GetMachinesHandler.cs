using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Queries.GetMachines;

public class GetMachinesHandler : IRequestHandler<GetMachinesQuery, List<MachineDto>>
{
    private readonly IAppDbContext _context;

    public GetMachinesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MachineDto>> Handle(GetMachinesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Machines.AsQueryable();

        if (request.Type.HasValue)
            query = query.Where(m => m.Type == request.Type.Value);

        if (request.Status.HasValue)
            query = query.Where(m => m.Status == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.ToLower();
            query = query.Where(m =>
                m.Name.ToLower().Contains(term) ||
                m.InventoryNumber.ToLower().Contains(term) ||
                (m.Brand != null && m.Brand.ToLower().Contains(term)) ||
                (m.Model != null && m.Model.ToLower().Contains(term)));
        }

        return await query
            .OrderBy(m => m.Name)
            .Select(m => new MachineDto
            {
                Id = m.Id,
                Name = m.Name,
                InventoryNumber = m.InventoryNumber,
                Type = m.Type,
                Brand = m.Brand,
                Model = m.Model,
                Year = m.Year,
                Status = m.Status,
                FuelType = m.FuelType,
                FuelConsumptionPerHour = m.FuelConsumptionPerHour
            })
            .ToListAsync(cancellationToken);
    }
}
