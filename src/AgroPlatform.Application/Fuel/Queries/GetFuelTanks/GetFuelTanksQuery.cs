using AgroPlatform.Application.Fuel.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fuel.Queries.GetFuelTanks;

public record GetFuelTanksQuery : IRequest<List<FuelTankDto>>;
