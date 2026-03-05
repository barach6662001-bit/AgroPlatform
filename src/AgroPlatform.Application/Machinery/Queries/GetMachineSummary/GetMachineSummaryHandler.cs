using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Queries.GetMachineSummary;

public class GetMachineSummaryHandler : IRequestHandler<GetMachineSummaryQuery, MachineSummaryDto>
{
    private readonly IAppDbContext _context;

    public GetMachineSummaryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<MachineSummaryDto> Handle(GetMachineSummaryQuery request, CancellationToken cancellationToken)
    {
        var total = await _context.Machines.CountAsync(cancellationToken);
        var active = await _context.Machines.CountAsync(m => m.Status == MachineryStatus.Active, cancellationToken);
        var underRepair = await _context.Machines.CountAsync(m => m.Status == MachineryStatus.UnderRepair, cancellationToken);
        var totalHours = await _context.MachineWorkLogs.SumAsync(w => w.HoursWorked, cancellationToken);
        var totalFuel = await _context.FuelLogs.SumAsync(f => f.Quantity, cancellationToken);

        return new MachineSummaryDto
        {
            TotalMachines = total,
            ActiveCount = active,
            UnderRepairCount = underRepair,
            TotalHoursAllMachines = totalHours,
            TotalFuelAllMachines = totalFuel
        };
    }
}
