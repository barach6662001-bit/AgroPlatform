using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fuel.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fuel.Queries.GetFuelNorms;

public class GetFuelNormsHandler : IRequestHandler<GetFuelNormsQuery, IReadOnlyList<FuelNormDto>>
{
    private readonly IAppDbContext _context;

    public GetFuelNormsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<FuelNormDto>> Handle(GetFuelNormsQuery request, CancellationToken cancellationToken)
    {
        var norms = await _context.FuelNorms
            .AsNoTracking()
            .Where(n => !n.IsDeleted)
            .OrderBy(n => n.MachineType)
            .ThenBy(n => n.OperationType)
            .Select(n => new FuelNormDto
            {
                Id = n.Id,
                MachineType = n.MachineType.ToString(),
                OperationType = n.OperationType.ToString(),
                NormLitersPerHa = n.NormLitersPerHa,
                NormLitersPerHour = n.NormLitersPerHour,
                Notes = n.Notes,
            })
            .ToListAsync(cancellationToken);

        return norms;
    }
}
