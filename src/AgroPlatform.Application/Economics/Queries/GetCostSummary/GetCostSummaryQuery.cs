using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetCostSummary;

public record GetCostSummaryQuery(
    string? Category,
    DateTime? DateFrom,
    DateTime? DateTo
) : IRequest<CostSummaryDto>;

public record CostSummaryDto(
    decimal TotalAmount,
    IReadOnlyList<CategorySummaryDto> ByCategory
);

public record CategorySummaryDto(string Category, decimal Amount, int Count);
