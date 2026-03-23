namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Year-over-year seasonal comparison metrics for one calendar year.</summary>
public class SeasonComparisonDto
{
    public int Year { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalCosts { get; set; }
    public decimal Margin { get; set; }
    public decimal? MarginPercent { get; set; }
    public decimal? TotalAreaHectares { get; set; }
    public decimal? CostsPerHectare { get; set; }
    public decimal? RevenuePerHectare { get; set; }
}
