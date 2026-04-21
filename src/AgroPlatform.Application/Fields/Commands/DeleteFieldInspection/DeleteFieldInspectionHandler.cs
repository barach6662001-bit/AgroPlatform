using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldInspection;

public class DeleteFieldInspectionHandler : IRequestHandler<DeleteFieldInspectionCommand>
{
    private readonly IAppDbContext _context;

    public DeleteFieldInspectionHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteFieldInspectionCommand request, CancellationToken cancellationToken)
    {
        var inspection = await _context.FieldInspections
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(FieldInspection), request.Id);

        if (inspection.FieldId != request.FieldId)
            throw new NotFoundException(nameof(FieldInspection), request.Id);

        _context.FieldInspections.Remove(inspection);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
