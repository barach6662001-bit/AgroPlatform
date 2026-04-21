using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class FieldSeeding : AuditableEntity
{
    public Guid FieldId { get; set; }
    public Field Field { get; set; } = null!;
    public int Year { get; set; }
    public string CropName { get; set; } = string.Empty;
    public string? Variety { get; set; }
    public decimal? SeedingRateKgPerHa { get; set; }
    public decimal? TotalSeedKg { get; set; }
    public DateTime? SeedingDate { get; set; }
    public string? Notes { get; set; }
}
