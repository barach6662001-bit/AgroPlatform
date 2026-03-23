using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetSeasonComparison;

/// <summary>Returns season comparison metrics for each of the requested calendar years.</summary>
/// <param name="Years">List of calendar years to compare. When empty defaults to the last three years.</param>
public record GetSeasonComparisonQuery(IReadOnlyList<int> Years) : IRequest<IReadOnlyList<SeasonComparisonDto>>;
