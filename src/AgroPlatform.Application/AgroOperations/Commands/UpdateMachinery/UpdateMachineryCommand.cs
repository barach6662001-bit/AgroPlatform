using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.UpdateMachinery;

public record UpdateMachineryCommand(
    Guid MachineryId,
    decimal? HoursWorked,
    decimal? FuelUsed,
    string? OperatorName
) : IRequest;
