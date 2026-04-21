using AgroPlatform.Application.Economics.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetCostSummary;

public record GetCostSummaryQuery(
    CostCategory? Category,
    DateTime? DateFrom,
    DateTime? DateTo
) : IRequest<CostSummaryDto>;

public record CostSummaryDto(
    decimal TotalAmount,
    IReadOnlyList<EconomicsByCategoryDto> ByCategory
);
