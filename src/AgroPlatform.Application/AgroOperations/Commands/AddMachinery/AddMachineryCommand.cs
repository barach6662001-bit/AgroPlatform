using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.AddMachinery;

public record AddMachineryCommand(
    Guid AgroOperationId,
    Guid MachineId,
    decimal? HoursWorked,
    decimal? FuelUsed,
    string? OperatorName
) : IRequest<Guid>;
