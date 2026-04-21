using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldZone;

public class DeleteFieldZoneHandler : IRequestHandler<DeleteFieldZoneCommand>
{
    private readonly IAppDbContext _context;

    public DeleteFieldZoneHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteFieldZoneCommand request, CancellationToken cancellationToken)
    {
        var zone = await _context.FieldZones
            .FirstOrDefaultAsync(z => z.Id == request.Id, cancellationToken);

        if (zone is null)
            throw new NotFoundException(nameof(FieldZone), request.Id);

        if (zone.FieldId != request.FieldId)
            throw new NotFoundException(nameof(FieldZone), request.Id);

        _context.FieldZones.Remove(zone);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
