namespace AgroPlatform.Application.Analytics.DTOs;

public class FieldEfficiencyDto
{
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public decimal AreaHectares { get; set; }
    public string? CurrentCrop { get; set; }
    public int OperationsCount { get; set; }
    public decimal TotalCosts { get; set; }
    public decimal CostPerHectare { get; set; }
    public decimal? YieldPerHectare { get; set; }
    public decimal? TotalHarvestTons { get; set; }
    public decimal? RevenueTotal { get; set; }
}
