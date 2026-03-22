namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Aggregated marginality / profitability data for the dashboard.</summary>
public class MarginalitySummaryDto
{
    /// <summary>Total revenue from sales records for the period.</summary>
    public decimal TotalRevenue { get; set; }

    /// <summary>Total costs from cost records for the period.</summary>
    public decimal TotalCosts { get; set; }

    /// <summary>Net margin = TotalRevenue - TotalCosts.</summary>
    public decimal Margin { get; set; }

    /// <summary>Margin as a percentage of revenue. Null when TotalRevenue is zero.</summary>
    public decimal? MarginPercent { get; set; }

    /// <summary>Revenue broken down by product (from Sales.Product).</summary>
    public List<MarginalityRowDto> ByProduct { get; set; } = new();

    /// <summary>Revenue, costs, and margin broken down by field.</summary>
    public List<MarginalityRowDto> ByField { get; set; } = new();
}
