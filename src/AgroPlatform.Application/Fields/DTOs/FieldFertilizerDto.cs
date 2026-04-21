namespace AgroPlatform.Application.Fields.DTOs;

public class FieldFertilizerDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public string FertilizerName { get; set; } = string.Empty;
    public string? ApplicationType { get; set; }
    public decimal? RateKgPerHa { get; set; }
    public decimal? TotalKg { get; set; }
    public decimal? CostPerKg { get; set; }
    public decimal? TotalCost { get; set; }
    public DateTime ApplicationDate { get; set; }
    public string? Notes { get; set; }
}
