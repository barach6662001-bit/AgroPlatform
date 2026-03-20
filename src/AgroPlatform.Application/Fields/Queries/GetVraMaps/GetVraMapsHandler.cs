using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetVraMaps;

public class GetVraMapsHandler : IRequestHandler<GetVraMapsQuery, IReadOnlyList<VraMapDto>>
{
    private readonly IAppDbContext _context;

    public GetVraMapsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<VraMapDto>> Handle(GetVraMapsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.VraMaps
            .Include(m => m.Zones)
            .Where(m => m.FieldId == request.FieldId);

        if (request.Year.HasValue)
            query = query.Where(m => m.Year == request.Year.Value);

        var maps = await query
            .OrderByDescending(m => m.Year)
            .ThenByDescending(m => m.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return maps.Select(m => new VraMapDto
        {
            Id = m.Id,
            FieldId = m.FieldId,
            Name = m.Name,
            FertilizerName = m.FertilizerName,
            Year = m.Year,
            Notes = m.Notes,
            CreatedAtUtc = m.CreatedAtUtc,
            Zones = m.Zones
                .OrderBy(z => z.ZoneIndex)
                .Select(z => new VraZoneDto
                {
                    Id = z.Id,
                    ZoneIndex = z.ZoneIndex,
                    ZoneName = z.ZoneName,
                    NdviValue = z.NdviValue,
                    SoilOrganicMatter = z.SoilOrganicMatter,
                    SoilNitrogen = z.SoilNitrogen,
                    SoilPhosphorus = z.SoilPhosphorus,
                    SoilPotassium = z.SoilPotassium,
                    AreaHectares = z.AreaHectares,
                    RateKgPerHa = z.RateKgPerHa,
                    Color = z.Color,
                })
                .ToList(),
        }).ToList();
    }
}
