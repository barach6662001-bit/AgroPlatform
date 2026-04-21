using AgroPlatform.Application.Fuel.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fuel.Queries.GetFuelNorms;

public record GetFuelNormsQuery : IRequest<IReadOnlyList<FuelNormDto>>;
