using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetBreakEven;

/// <summary>Returns break-even yield per field for the given year and price assumption.</summary>
/// <param name="Year">Calendar year to analyse. Defaults to current year.</param>
/// <param name="PricePerTonne">Assumed sale price in UAH per tonne used in the break-even formula.</param>
public record GetBreakEvenQuery(
    int? Year,
    decimal PricePerTonne
) : IRequest<IReadOnlyList<BreakEvenDto>>;
