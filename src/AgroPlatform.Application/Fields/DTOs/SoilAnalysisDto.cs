namespace AgroPlatform.Application.Fields.DTOs;

public class SoilAnalysisDto
{
    public Guid Id { get; set; }
    public Guid FieldId { get; set; }
    public string? ZoneId { get; set; }
    public DateTime SampleDate { get; set; }
    public decimal? Ph { get; set; }
    public decimal? N { get; set; }
    public decimal? P { get; set; }
    public decimal? K { get; set; }
    public decimal? Humus { get; set; }
    public string? Notes { get; set; }
}
