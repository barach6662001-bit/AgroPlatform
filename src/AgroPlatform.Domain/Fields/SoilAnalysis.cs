using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class SoilAnalysis : AuditableEntity
{
    public Guid FieldId { get; set; }
    public Field Field { get; set; } = null!;
    public string? ZoneId { get; set; }
    public DateTime SampleDate { get; set; }
    public decimal? Ph { get; set; }
    public decimal? N { get; set; }
    public decimal? P { get; set; }
    public decimal? K { get; set; }
    public decimal? Humus { get; set; }
    public string? Notes { get; set; }
}
