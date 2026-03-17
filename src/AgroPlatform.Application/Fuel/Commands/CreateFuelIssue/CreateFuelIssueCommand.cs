using MediatR;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelIssue;

public record CreateFuelIssueCommand(
    Guid FuelTankId,
    decimal QuantityLiters,
    decimal? PricePerLiter,
    DateTime TransactionDate,
    Guid? MachineId,
    string? DriverName,
    string? Notes
) : IRequest<Guid>;
