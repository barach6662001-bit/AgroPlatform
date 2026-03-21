using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.UpdateFieldZone;

public class UpdateFieldZoneHandler : IRequestHandler<UpdateFieldZoneCommand>
{
    private readonly IAppDbContext _context;

    public UpdateFieldZoneHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateFieldZoneCommand request, CancellationToken cancellationToken)
    {
        var zone = await _context.FieldZones
            .FirstOrDefaultAsync(z => z.Id == request.Id, cancellationToken);

        if (zone is null)
            throw new NotFoundException(nameof(FieldZone), request.Id);

        zone.Name = request.Name;
        zone.GeoJson = request.GeoJson;
        zone.SoilType = request.SoilType;
        zone.Notes = request.Notes;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
