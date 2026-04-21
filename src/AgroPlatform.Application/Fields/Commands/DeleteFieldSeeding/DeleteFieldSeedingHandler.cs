using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldSeeding;

public class DeleteFieldSeedingHandler : IRequestHandler<DeleteFieldSeedingCommand>
{
    private readonly IAppDbContext _context;

    public DeleteFieldSeedingHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteFieldSeedingCommand request, CancellationToken cancellationToken)
    {
        var seeding = await _context.FieldSeedings
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(FieldSeeding), request.Id);

        if (seeding.FieldId != request.FieldId)
            throw new NotFoundException(nameof(FieldSeeding), request.Id);

        _context.FieldSeedings.Remove(seeding);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
