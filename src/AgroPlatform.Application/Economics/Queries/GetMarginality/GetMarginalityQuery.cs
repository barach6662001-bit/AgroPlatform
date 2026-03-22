using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetMarginality;

/// <summary>Returns marginality (profitability) summary rows for a given year.</summary>
/// <param name="Year">Calendar year. Defaults to current year.</param>
/// <param name="GroupBy">Grouping dimension: "field" (default) or "product".</param>
public record GetMarginalityQuery(
    int? Year,
    string? GroupBy
) : IRequest<IReadOnlyList<MarginalityRowDto>>;
