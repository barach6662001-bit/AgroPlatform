using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.AddFuelLog;

public record AddFuelLogCommand(
    Guid MachineId,
    DateTime Date,
    decimal Quantity,
    FuelType FuelType,
    string? Note
) : IRequest<Guid>;
