using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Machinery;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.AddMachinery;

public class AddMachineryHandler : IRequestHandler<AddMachineryCommand, Guid>
{
    private readonly IAppDbContext _context;

    public AddMachineryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AddMachineryCommand request, CancellationToken cancellationToken)
    {
        _ = await _context.AgroOperations.FindAsync(new object[] { request.AgroOperationId }, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperation), request.AgroOperationId);

        _ = await _context.Machines.FindAsync(new object[] { request.MachineId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Machine), request.MachineId);

        var machinery = new AgroOperationMachinery
        {
            AgroOperationId = request.AgroOperationId,
            MachineId = request.MachineId,
            HoursWorked = request.HoursWorked,
            FuelUsed = request.FuelUsed,
            OperatorName = request.OperatorName
        };

        _context.AgroOperationMachineries.Add(machinery);
        await _context.SaveChangesAsync(cancellationToken);
        return machinery.Id;
    }
}
