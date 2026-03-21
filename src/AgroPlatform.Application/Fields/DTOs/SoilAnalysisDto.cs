namespace AgroPlatform.Application.Fields.DTOs;

public class SoilAnalysisDto
{
    public Guid Id { get; set; }
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
