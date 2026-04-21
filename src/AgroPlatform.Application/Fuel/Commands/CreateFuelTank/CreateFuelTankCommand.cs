using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelTank;

public record CreateFuelTankCommand(
    string Name,
    FuelType FuelType,
    decimal CapacityLiters
) : IRequest<Guid>;
