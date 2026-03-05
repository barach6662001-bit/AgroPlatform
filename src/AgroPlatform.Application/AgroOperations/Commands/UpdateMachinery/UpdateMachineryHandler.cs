using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.UpdateMachinery;

public class UpdateMachineryHandler : IRequestHandler<UpdateMachineryCommand>
{
    private readonly IAppDbContext _context;

    public UpdateMachineryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateMachineryCommand request, CancellationToken cancellationToken)
    {
        var machinery = await _context.AgroOperationMachineries.FindAsync(new object[] { request.MachineryId }, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperationMachinery), request.MachineryId);

        machinery.HoursWorked = request.HoursWorked;
        machinery.FuelUsed = request.FuelUsed;
        machinery.OperatorName = request.OperatorName;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
