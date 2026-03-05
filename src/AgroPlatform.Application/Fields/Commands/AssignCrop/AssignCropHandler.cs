using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.AssignCrop;

public class AssignCropHandler : IRequestHandler<AssignCropCommand, Guid>
{
    private readonly IAppDbContext _context;

    public AssignCropHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AssignCropCommand request, CancellationToken cancellationToken)
    {
        var field = await _context.Fields.FindAsync(new object[] { request.FieldId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Field), request.FieldId);

        var historyExists = await _context.FieldCropHistories
            .AnyAsync(h => h.FieldId == request.FieldId && h.Year == request.Year, cancellationToken);

        if (historyExists)
            throw new ConflictException($"A crop history record for field '{request.FieldId}' and year '{request.Year}' already exists.");

        var history = new FieldCropHistory
        {
            FieldId = request.FieldId,
            Crop = request.Crop,
            Year = request.Year,
            YieldPerHectare = request.YieldPerHectare,
            Notes = request.Notes
        };

        _context.FieldCropHistories.Add(history);

        if (field.CurrentCropYear == null || request.Year >= field.CurrentCropYear)
        {
            field.CurrentCrop = request.Crop;
            field.CurrentCropYear = request.Year;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return history.Id;
    }
}
