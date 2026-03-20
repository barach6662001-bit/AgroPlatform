using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.DeleteVraMap;

public class DeleteVraMapHandler : IRequestHandler<DeleteVraMapCommand>
{
    private readonly IAppDbContext _context;

    public DeleteVraMapHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteVraMapCommand request, CancellationToken cancellationToken)
    {
        var map = await _context.VraMaps
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (map == null)
            throw new NotFoundException(nameof(VraMap), request.Id);

        _context.VraMaps.Remove(map);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
