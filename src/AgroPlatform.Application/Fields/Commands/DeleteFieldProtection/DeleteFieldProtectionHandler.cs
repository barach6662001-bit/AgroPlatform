using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldProtection;

public class DeleteFieldProtectionHandler : IRequestHandler<DeleteFieldProtectionCommand>
{
    private readonly IAppDbContext _context;

    public DeleteFieldProtectionHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteFieldProtectionCommand request, CancellationToken cancellationToken)
    {
        var protection = await _context.FieldProtections
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(FieldProtection), request.Id);

        if (protection.FieldId != request.FieldId)
            throw new NotFoundException(nameof(FieldProtection), request.Id);

        _context.FieldProtections.Remove(protection);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
