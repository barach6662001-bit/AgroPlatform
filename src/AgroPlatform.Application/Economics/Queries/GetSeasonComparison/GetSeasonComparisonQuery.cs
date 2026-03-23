using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetSeasonComparison;

public record GetSeasonComparisonQuery(int[] Years) : IRequest<IReadOnlyList<SeasonComparisonDto>>;

public class SeasonComparisonDto
{
    public int Year { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalCosts { get; set; }
    public decimal Margin { get; set; }
    public decimal? MarginPercent { get; set; }
    public decimal? AreaHa { get; set; }
    public decimal? CostPerHa { get; set; }
    public decimal? RevenuePerHa { get; set; }
}
