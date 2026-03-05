using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Machinery;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Commands.AddFuelLog;

public class AddFuelLogHandler : IRequestHandler<AddFuelLogCommand, Guid>
{
    private readonly IAppDbContext _context;

    public AddFuelLogHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AddFuelLogCommand request, CancellationToken cancellationToken)
    {
        if (!await _context.Machines.AnyAsync(m => m.Id == request.MachineId, cancellationToken))
            throw new NotFoundException(nameof(Machine), request.MachineId);

        var fuelLog = new FuelLog
        {
            MachineId = request.MachineId,
            Date = request.Date,
            Quantity = request.Quantity,
            FuelType = request.FuelType,
            Note = request.Note
        };

        _context.FuelLogs.Add(fuelLog);
        await _context.SaveChangesAsync(cancellationToken);
        return fuelLog.Id;
    }
}
