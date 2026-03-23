using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetMarginality;

/// <summary>Returns marginality summary (revenue vs costs, by product and by field) for the given year.</summary>
/// <param name="Year">Calendar year to analyse. Defaults to current year.</param>
public record GetMarginalityQuery(int? Year) : IRequest<MarginalitySummaryDto>;
