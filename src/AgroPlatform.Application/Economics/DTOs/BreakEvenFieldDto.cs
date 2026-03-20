namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Break-even analysis result for a single field.</summary>
public class BreakEvenFieldDto
{
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public decimal AreaHectares { get; set; }
    public string? CurrentCrop { get; set; }

    /// <summary>Total costs from CostRecord entities linked to this field for the requested year.</summary>
    public decimal TotalCosts { get; set; }

    /// <summary>
    /// Minimum yield (t/ha) required to cover all costs at the given price.
    /// Formula: TotalCosts / (PricePerTonne * AreaHectares).
    /// Null when area is zero or costs are zero.
    /// </summary>
    public decimal? MinYieldPerHectare { get; set; }
}
