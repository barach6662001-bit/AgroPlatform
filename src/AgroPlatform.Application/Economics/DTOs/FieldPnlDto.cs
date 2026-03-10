namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Profit &amp; Loss summary for one field for a given year.</summary>
public class FieldPnlDto
{
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public decimal AreaHectares { get; set; }
    public string? CurrentCrop { get; set; }

    /// <summary>Total costs from CostRecord entities linked to this field.</summary>
    public decimal TotalCosts { get; set; }

    /// <summary>Cost broken down by category.</summary>
    public Dictionary<string, decimal> CostsByCategory { get; set; } = new();

    /// <summary>Cost per hectare (TotalCosts / AreaHectares).</summary>
    public decimal CostPerHectare { get; set; }

    /// <summary>Actual yield (t/ha) from FieldCropHistory for the requested year (null if not recorded).</summary>
    public decimal? ActualYieldPerHectare { get; set; }

    /// <summary>Estimated revenue = ActualYieldPerHectare * AreaHectares * EstimatedPricePerTonne.
    /// Null if yield data missing or price not provided.</summary>
    public decimal? EstimatedRevenue { get; set; }

    /// <summary>Estimated net profit = EstimatedRevenue - TotalCosts. Null if revenue unknown.</summary>
    public decimal? NetProfit { get; set; }

    /// <summary>Revenue per hectare = EstimatedRevenue / AreaHectares. Null if revenue unknown.</summary>
    public decimal? RevenuePerHectare { get; set; }
}
