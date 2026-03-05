using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Machinery;
using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.UpdateMachine;

public class UpdateMachineHandler : IRequestHandler<UpdateMachineCommand>
{
    private readonly IAppDbContext _context;

    public UpdateMachineHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateMachineCommand request, CancellationToken cancellationToken)
    {
        var machine = await _context.Machines.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(Machine), request.Id);

        machine.Name = request.Name;
        machine.Brand = request.Brand;
        machine.Model = request.Model;
        machine.Year = request.Year;
        machine.Status = request.Status;
        machine.FuelType = request.FuelType;
        machine.FuelConsumptionPerHour = request.FuelConsumptionPerHour;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
