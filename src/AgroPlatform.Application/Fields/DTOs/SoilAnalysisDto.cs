namespace AgroPlatform.Application.Fields.DTOs;

public class SoilAnalysisDto
{
    public Guid Id { get; set; }
    public Guid? ZoneId { get; set; }
    public DateTime SampleDate { get; set; }
    public decimal? pH { get; set; }
    public decimal? Nitrogen { get; set; }
    public decimal? Phosphorus { get; set; }
    public decimal? Potassium { get; set; }
    public decimal? Humus { get; set; }
    public string? Notes { get; set; }
}
