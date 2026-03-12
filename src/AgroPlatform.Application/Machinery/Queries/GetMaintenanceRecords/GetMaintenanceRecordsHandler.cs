using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Queries.GetMaintenanceRecords;

public class GetMaintenanceRecordsHandler : IRequestHandler<GetMaintenanceRecordsQuery, List<MaintenanceRecordDto>>
{
    private readonly IAppDbContext _context;

    public GetMaintenanceRecordsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MaintenanceRecordDto>> Handle(GetMaintenanceRecordsQuery request, CancellationToken cancellationToken)
    {
        return await _context.MaintenanceRecords
            .Where(m => m.MachineId == request.MachineId)
            .OrderByDescending(m => m.Date)
            .Select(m => new MaintenanceRecordDto(m.Id, m.Date, m.Type, m.Description, m.Cost, m.HoursAtMaintenance))
            .ToListAsync(cancellationToken);
    }
}
