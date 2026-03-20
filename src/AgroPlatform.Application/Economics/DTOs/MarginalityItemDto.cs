namespace AgroPlatform.Application.Economics.DTOs;

public class MarginalityItemDto
{
    public string CropName { get; set; } = string.Empty;
    public decimal AreaHa { get; set; }

    // Actual (факт): revenue from harvests minus costs from cost records
    public decimal ActualRevenue { get; set; }
    public decimal ActualCosts { get; set; }
    public decimal ActualMargin { get; set; }

    // Planned (план): from Budget table for the year
    public decimal PlannedCosts { get; set; }
    public decimal PlannedMargin { get; set; }

    // Projected (прогноз): area × avg yield × estimated price − planned costs
    public decimal? ProjectedRevenue { get; set; }
    public decimal? ProjectedMargin { get; set; }
}
