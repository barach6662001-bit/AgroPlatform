using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Machinery;
using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.AddMaintenance;

public class AddMaintenanceHandler : IRequestHandler<AddMaintenanceCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AddMaintenanceHandler(IAppDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddMaintenanceCommand request, CancellationToken cancellationToken)
    {
        var machine = await _context.Machines.FindAsync([request.MachineId], cancellationToken)
            ?? throw new NotFoundException(nameof(Machine), request.MachineId);

        var record = new MaintenanceRecord
        {
            TenantId = _currentUser.TenantId,
            MachineId = request.MachineId,
            Date = request.Date,
            Type = request.Type,
            Description = request.Description,
            Cost = request.Cost,
            HoursAtMaintenance = request.HoursAtMaintenance,
            CreatedAtUtc = DateTime.UtcNow,
        };

        machine.LastMaintenanceDate = request.Date;
        if (request.NextMaintenanceDate.HasValue)
            machine.NextMaintenanceDate = request.NextMaintenanceDate.Value;

        _context.MaintenanceRecords.Add(record);

        if (request.Cost.HasValue && request.Cost.Value > 0)
        {
            _context.CostRecords.Add(new CostRecord
            {
                Category = "Equipment",
                Amount = request.Cost.Value,
                Currency = "UAH",
                Date = request.Date,
                Description = $"ТО: {machine?.Name ?? "Техніка"} — {request.Type}"
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return record.Id;
    }
}
