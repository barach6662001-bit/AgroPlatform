using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.AddMaintenance;

public record AddMaintenanceCommand(
    Guid MachineId,
    DateTime Date,
    string Type,
    string? Description,
    decimal? Cost,
    decimal? HoursAtMaintenance,
    DateTime? NextMaintenanceDate
) : IRequest<Guid>;
