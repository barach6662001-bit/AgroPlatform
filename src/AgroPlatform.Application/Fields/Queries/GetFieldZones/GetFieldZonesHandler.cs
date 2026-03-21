using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetFieldZones;

public class GetFieldZonesHandler : IRequestHandler<GetFieldZonesQuery, List<FieldZoneDto>>
{
    private readonly IAppDbContext _context;

    public GetFieldZonesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FieldZoneDto>> Handle(GetFieldZonesQuery request, CancellationToken cancellationToken)
    {
        return await _context.FieldZones
            .Where(z => z.FieldId == request.FieldId)
            .OrderBy(z => z.Name)
            .Select(z => new FieldZoneDto
            {
                Id = z.Id,
                Name = z.Name,
                GeoJson = z.GeoJson,
                SoilType = z.SoilType,
                Notes = z.Notes,
            })
            .ToListAsync(cancellationToken);
    }
}
