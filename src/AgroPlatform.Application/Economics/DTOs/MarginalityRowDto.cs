namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>One row in the marginality (profitability) summary dashboard.</summary>
public class MarginalityRowDto
{
    /// <summary>Label used for grouping — field name or product/crop name.</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>Total revenue from Sales records (UAH).</summary>
    public decimal Revenue { get; set; }

    /// <summary>Total costs from CostRecord entries (UAH).</summary>
    public decimal Costs { get; set; }

    /// <summary>Gross margin = Revenue − Costs (UAH).</summary>
    public decimal Margin { get; set; }

    /// <summary>Margin as percentage of revenue. Null when revenue is zero.</summary>
    public decimal? MarginPercent { get; set; }
}
