namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Unified economics summary for a single season/year, used in season comparison.</summary>
public class EconomicsByYearDto
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
