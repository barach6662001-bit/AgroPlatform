namespace AgroPlatform.Application.Fields.DTOs;

public class FieldProtectionDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProtectionType { get; set; }
    public decimal? RateLPerHa { get; set; }
    public decimal? TotalLiters { get; set; }
    public decimal? CostPerLiter { get; set; }
    public decimal? TotalCost { get; set; }
    public DateTime ApplicationDate { get; set; }
    public string? Notes { get; set; }
}
