namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Marginality row for one product or field.</summary>
public class MarginalityRowDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Costs { get; set; }
    public decimal Margin { get; set; }
    public decimal? MarginPercent { get; set; }
}

/// <summary>Aggregated marginality summary for a given year.</summary>
public class MarginalitySummaryDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalCosts { get; set; }
    public decimal Margin { get; set; }
    public decimal? MarginPercent { get; set; }
    public IReadOnlyList<MarginalityRowDto> ByProduct { get; set; } = [];
    public IReadOnlyList<MarginalityRowDto> ByField { get; set; } = [];
}
