using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class SoilAnalysis : AuditableEntity
{
    public Guid FieldId { get; set; }
    public Field Field { get; set; } = null!;
    public Guid? ZoneId { get; set; }
    public DateTime SampleDate { get; set; }
    public decimal? pH { get; set; }
    public decimal? Nitrogen { get; set; }
    public decimal? Phosphorus { get; set; }
    public decimal? Potassium { get; set; }
    public decimal? Humus { get; set; }
    public string? Notes { get; set; }
}
