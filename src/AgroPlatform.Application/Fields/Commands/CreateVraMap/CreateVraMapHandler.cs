using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateVraMap;

public class CreateVraMapHandler : IRequestHandler<CreateVraMapCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateVraMapHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateVraMapCommand request, CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId, cancellationToken);

        if (!fieldExists)
            throw new NotFoundException(nameof(Field), request.FieldId);

        var map = new VraMap
        {
            FieldId = request.FieldId,
            Name = request.Name,
            FertilizerName = request.FertilizerName,
            Year = request.Year,
            Notes = request.Notes,
            Zones = request.Zones.Select(z => new VraZone
            {
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
            }).ToList(),
        };

        _context.VraMaps.Add(map);
        await _context.SaveChangesAsync(cancellationToken);
        return map.Id;
    }
}
