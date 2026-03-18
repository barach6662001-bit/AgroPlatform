using MediatR;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelIssue;

public record CreateFuelIssueCommand(
    Guid FuelTankId,
    decimal QuantityLiters,
    DateTime TransactionDate,
    Guid? MachineId,
    string? DriverName,
    string? Notes
) : IRequest<Guid>;
