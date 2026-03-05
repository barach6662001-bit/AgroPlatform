using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.AddWorkLog;

public record AddWorkLogCommand(
    Guid MachineId,
    DateTime Date,
    decimal HoursWorked,
    Guid? AgroOperationId,
    string? Description
) : IRequest<Guid>;
