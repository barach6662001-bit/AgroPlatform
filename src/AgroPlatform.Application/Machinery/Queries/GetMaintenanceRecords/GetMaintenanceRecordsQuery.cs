using MediatR;

namespace AgroPlatform.Application.Machinery.Queries.GetMaintenanceRecords;

public record GetMaintenanceRecordsQuery(Guid MachineId) : IRequest<List<MaintenanceRecordDto>>;

public record MaintenanceRecordDto(
    Guid Id,
    DateTime Date,
    string Type,
    string? Description,
    decimal? Cost,
    decimal? HoursAtMaintenance
);
