namespace AgroPlatform.Application.Fields.DTOs;

public class FieldHarvestDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public string CropName { get; set; } = string.Empty;
    public decimal TotalTons { get; set; }
    public decimal? YieldTonsPerHa { get; set; }
    public decimal? MoisturePercent { get; set; }
    public decimal? PricePerTon { get; set; }
    public decimal? TotalRevenue { get; set; }
    public DateTime HarvestDate { get; set; }
    public string? Notes { get; set; }
}
