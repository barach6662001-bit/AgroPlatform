using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class FieldFertilizer : AuditableEntity
{
    public Guid FieldId { get; set; }
    public Field Field { get; set; } = null!;
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
