using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetFieldPnl;

/// <summary>Returns P&amp;L per field for the requested year.</summary>
/// <param name="Year">Calendar year to analyse. Defaults to current year.</param>
/// <param name="EstimatedPricePerTonne">Optional price (UAH per tonne) used to estimate revenue from yield data.</param>
/// <param name="FieldId">Optional: filter to a single field.</param>
public record GetFieldPnlQuery(
    int? Year,
    decimal? EstimatedPricePerTonne,
    Guid? FieldId
) : IRequest<IReadOnlyList<FieldPnlDto>>;
