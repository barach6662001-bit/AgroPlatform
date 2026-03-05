using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.PlanRotation;

public class PlanRotationHandler : IRequestHandler<PlanRotationCommand, Guid>
{
    private readonly IAppDbContext _context;

    public PlanRotationHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(PlanRotationCommand request, CancellationToken cancellationToken)
    {
        _ = await _context.Fields.FindAsync(new object[] { request.FieldId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Field), request.FieldId);

        var existing = await _context.CropRotationPlans
            .FirstOrDefaultAsync(p => p.FieldId == request.FieldId && p.Year == request.Year, cancellationToken);

        if (existing != null)
        {
            existing.PlannedCrop = request.PlannedCrop;
            existing.Notes = request.Notes;
            await _context.SaveChangesAsync(cancellationToken);
            return existing.Id;
        }

        var plan = new CropRotationPlan
        {
            FieldId = request.FieldId,
            Year = request.Year,
            PlannedCrop = request.PlannedCrop,
            Notes = request.Notes
        };

        _context.CropRotationPlans.Add(plan);
        await _context.SaveChangesAsync(cancellationToken);
        return plan.Id;
    }
}
