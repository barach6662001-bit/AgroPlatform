using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fuel.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fuel.Queries.GetFuelTanks;

public class GetFuelTanksHandler : IRequestHandler<GetFuelTanksQuery, List<FuelTankDto>>
{
    private readonly IAppDbContext _context;

    public GetFuelTanksHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FuelTankDto>> Handle(GetFuelTanksQuery request, CancellationToken cancellationToken)
    {
        return await _context.FuelTanks
            .AsNoTracking()
            .OrderBy(t => t.Name)
            .Select(t => new FuelTankDto
            {
                Id = t.Id,
                Name = t.Name,
                FuelType = (int)t.FuelType,
                CapacityLiters = t.CapacityLiters,
                CurrentLiters = t.CurrentLiters,
                PricePerLiter = t.PricePerLiter,
                IsActive = t.IsActive,
                FillPercentage = t.CapacityLiters > 0
                    ? Math.Round(t.CurrentLiters / t.CapacityLiters * 100, 1)
                    : 0,
            })
            .ToListAsync(cancellationToken);
    }
}
