using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetSeasonComparison;

public record GetSeasonComparisonQuery(int[] Years) : IRequest<IReadOnlyList<EconomicsByYearDto>>;
