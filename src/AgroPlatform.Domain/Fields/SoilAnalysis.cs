using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class SoilAnalysis : AuditableEntity
{
    public Guid FieldId { get; set; }
    public Field Field { get; set; } = null!;
    public int Year { get; set; }
    public DateTime? SampleDate { get; set; }
    public decimal? Ph { get; set; }
    public decimal? OrganicMatter { get; set; }
    public decimal? Nitrogen { get; set; }
    public decimal? Phosphorus { get; set; }
    public decimal? Potassium { get; set; }
    public int? SampleDepthCm { get; set; }
    public string? LabName { get; set; }
    public string? Notes { get; set; }
}
