using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldInspection;

public class CreateFieldInspectionHandler : IRequestHandler<CreateFieldInspectionCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFieldInspectionHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFieldInspectionCommand request, CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId, cancellationToken);

        if (!fieldExists)
            throw new NotFoundException(nameof(Field), request.FieldId);

        var inspection = new FieldInspection
        {
            FieldId = request.FieldId,
            Date = request.Date,
            InspectorName = request.InspectorName,
            Notes = request.Notes,
            Severity = request.Severity,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            PhotoUrl = request.PhotoUrl,
        };

        _context.FieldInspections.Add(inspection);
        await _context.SaveChangesAsync(cancellationToken);
        return inspection.Id;
    }
}
