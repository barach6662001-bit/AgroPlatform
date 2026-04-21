using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.CreateMachine;

public record CreateMachineCommand(
    string Name,
    string InventoryNumber,
    MachineryType Type,
    string? Brand,
    string? Model,
    int? Year,
    FuelType FuelType,
    decimal? FuelConsumptionPerHour,
    Guid? AssignedDriverId,
    string? AssignedDriverName
) : IRequest<Guid>;
