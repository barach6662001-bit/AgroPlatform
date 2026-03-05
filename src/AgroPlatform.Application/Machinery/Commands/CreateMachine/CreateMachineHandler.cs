using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Machinery;
using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.CreateMachine;

public class CreateMachineHandler : IRequestHandler<CreateMachineCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateMachineHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateMachineCommand request, CancellationToken cancellationToken)
    {
        var machine = new Machine
        {
            Name = request.Name,
            InventoryNumber = request.InventoryNumber,
            Type = request.Type,
            Brand = request.Brand,
            Model = request.Model,
            Year = request.Year,
            FuelType = request.FuelType,
            FuelConsumptionPerHour = request.FuelConsumptionPerHour
        };

        _context.Machines.Add(machine);
        await _context.SaveChangesAsync(cancellationToken);
        return machine.Id;
    }
}
