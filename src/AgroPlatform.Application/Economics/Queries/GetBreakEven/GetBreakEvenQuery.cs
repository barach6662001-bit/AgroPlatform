using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetBreakEven;

/// <summary>Returns break-even minimum yield per field for the requested year and price.</summary>
/// <param name="PricePerTonne">Price per tonne (UAH). Required – used in the break-even formula.</param>
/// <param name="Year">Calendar year to analyse. Defaults to current year.</param>
public record GetBreakEvenQuery(
    decimal PricePerTonne,
    int? Year
) : IRequest<IReadOnlyList<BreakEvenFieldDto>>;
