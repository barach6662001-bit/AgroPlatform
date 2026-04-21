using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetCostAnalytics;

public record GetCostAnalyticsQuery(int? Year) : IRequest<CostAnalyticsDto>;

public record CostAnalyticsDto(
    int Year,
    decimal TotalCosts,
    decimal TotalRevenue,
    IReadOnlyList<EconomicsByCategoryDto> ByCategory,
    IReadOnlyList<AnalyticsMonthDto> ByMonth
);

public record AnalyticsMonthDto(int Month, decimal Costs, decimal Revenue);
