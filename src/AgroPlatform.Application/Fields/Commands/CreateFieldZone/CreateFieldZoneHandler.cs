using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldZone;

public class CreateFieldZoneHandler : IRequestHandler<CreateFieldZoneCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFieldZoneHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFieldZoneCommand request, CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId, cancellationToken);

        if (!fieldExists)
            throw new NotFoundException(nameof(Field), request.FieldId);

        var zone = new FieldZone
        {
            FieldId = request.FieldId,
            Name = request.Name,
            GeoJson = request.GeoJson,
            SoilType = request.SoilType,
            Notes = request.Notes,
        };

        _context.FieldZones.Add(zone);
        await _context.SaveChangesAsync(cancellationToken);
        return zone.Id;
    }
}
