using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteRotationPlan;

public class DeleteRotationPlanHandler : IRequestHandler<DeleteRotationPlanCommand>
{
    private readonly IAppDbContext _context;

    public DeleteRotationPlanHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteRotationPlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _context.CropRotationPlans.FindAsync(new object[] { request.PlanId }, cancellationToken)
            ?? throw new NotFoundException(nameof(CropRotationPlan), request.PlanId);

        _context.CropRotationPlans.Remove(plan);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
