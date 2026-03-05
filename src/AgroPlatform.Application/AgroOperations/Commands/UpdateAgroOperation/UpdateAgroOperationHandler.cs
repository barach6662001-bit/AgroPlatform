using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.UpdateAgroOperation;

public class UpdateAgroOperationHandler : IRequestHandler<UpdateAgroOperationCommand>
{
    private readonly IAppDbContext _context;

    public UpdateAgroOperationHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateAgroOperationCommand request, CancellationToken cancellationToken)
    {
        var operation = await _context.AgroOperations.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperation), request.Id);

        operation.PlannedDate = request.PlannedDate;
        operation.Description = request.Description;
        operation.AreaProcessed = request.AreaProcessed;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
