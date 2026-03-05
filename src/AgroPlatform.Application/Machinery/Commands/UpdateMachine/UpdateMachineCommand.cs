using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.UpdateMachine;

public record UpdateMachineCommand(
    Guid Id,
    string Name,
    string? Brand,
    string? Model,
    int? Year,
    MachineryStatus Status,
    FuelType FuelType,
    decimal? FuelConsumptionPerHour
) : IRequest;
