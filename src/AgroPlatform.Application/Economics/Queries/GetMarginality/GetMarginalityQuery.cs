using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetMarginality;

/// <summary>Returns aggregated marginality / profitability data for the dashboard.</summary>
/// <param name="Year">Calendar year to analyse. Defaults to current year.</param>
public record GetMarginalityQuery(int? Year) : IRequest<MarginalitySummaryDto>;
