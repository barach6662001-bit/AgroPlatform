namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Break-even analysis for a single field.</summary>
public class BreakEvenDto
{
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public decimal AreaHectares { get; set; }
    public string? CurrentCrop { get; set; }

    /// <summary>Total costs from CostRecord entities linked to this field for the requested year.</summary>
    public decimal TotalCosts { get; set; }

    /// <summary>Assumed price per tonne used for the break-even calculation.</summary>
    public decimal PricePerTonne { get; set; }

    /// <summary>
    /// Break-even yield in t/ha = TotalCosts / (PricePerTonne * AreaHectares).
    /// Null if AreaHectares is zero or PricePerTonne is zero.
    /// </summary>
    public decimal? BreakEvenYield { get; set; }
}
