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

    /// <summary>Actual yield (t/ha) from FieldHarvests/FieldCropHistory for the requested year.</summary>
    public decimal? ActualYieldPerHectare { get; set; }

    /// <summary>Total yield in tonnes for the year (YieldPerHa × AreaHa).</summary>
    public decimal? ActualYieldTons { get; set; }

    /// <summary>
    /// Direct revenue from the Sales table where Sale.FieldId matches this field and Sale.Date is in the year.
    /// This is real, booked revenue — preferred over estimates.
    /// </summary>
    public decimal ActualSalesRevenue { get; set; }

    /// <summary>
    /// Revenue captured via CostRecords with negative Amount (legacy revenue records).
    /// </summary>
    public decimal ActualCostRecordRevenue { get; set; }

    /// <summary>
    /// Best available revenue: ActualSalesRevenue if > 0, else ActualCostRecordRevenue if > 0,
    /// else EstimatedRevenue (yield × price). Null if no revenue data.
    /// </summary>
    public decimal? EstimatedRevenue { get; set; }

    /// <summary>Net profit = BestRevenue - TotalCosts. Null if revenue unknown.</summary>
    public decimal? NetProfit { get; set; }

    /// <summary>Revenue per hectare. Null if revenue unknown.</summary>
    public decimal? RevenuePerHectare { get; set; }

    /// <summary>Source of the revenue figure: "Sales", "CostRecords", "Estimated", or "None".</summary>
    public string RevenueSource { get; set; } = "None";
}
