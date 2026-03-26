using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldHarvest;

public class DeleteFieldHarvestHandler : IRequestHandler<DeleteFieldHarvestCommand>
{
    private readonly IAppDbContext _context;

    public DeleteFieldHarvestHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteFieldHarvestCommand request, CancellationToken cancellationToken)
    {
        var harvest = await _context.FieldHarvests
            .FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(FieldHarvest), request.Id);

        if (harvest.FieldId != request.FieldId)
            throw new NotFoundException(nameof(FieldHarvest), request.Id);

        _context.FieldHarvests.Remove(harvest);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
