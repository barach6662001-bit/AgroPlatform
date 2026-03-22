namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Marginality summary for a single field or product group.</summary>
public class MarginalityRowDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Costs { get; set; }
    public decimal Margin { get; set; }
    public decimal? MarginPercent { get; set; }
}
