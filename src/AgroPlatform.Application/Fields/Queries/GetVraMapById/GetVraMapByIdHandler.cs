using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetVraMapById;

public class GetVraMapByIdHandler : IRequestHandler<GetVraMapByIdQuery, VraMapDto?>
{
    private readonly IAppDbContext _context;

    public GetVraMapByIdHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<VraMapDto?> Handle(GetVraMapByIdQuery request, CancellationToken cancellationToken)
    {
        var m = await _context.VraMaps
            .Include(x => x.Zones)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (m == null) return null;

        return new VraMapDto
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
        };
    }
}
