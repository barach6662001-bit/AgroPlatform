namespace AgroPlatform.Application.Fields.DTOs;

public class PrescriptionZoneDto
{
    public Guid? ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    /// <summary>A, B, or C — HIGH, MEDIUM, LOW application rate class.</summary>
    public string RateClass { get; set; } = string.Empty;
    public decimal RecommendedRateKgPerHa { get; set; }
    public decimal? SoilNitrogen { get; set; }
    public decimal? SoilPhosphorus { get; set; }
    public decimal? SoilPotassium { get; set; }
    public decimal? SoilPH { get; set; }
    public decimal? SoilHumus { get; set; }
    public DateTime? SampleDate { get; set; }
    public string Nutrient { get; set; } = "Nitrogen";
}

public class PrescriptionMapDto
{
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public string Nutrient { get; set; } = "Nitrogen";
    /// <summary>NDVI snapshot date used as context (informational).</summary>
    public string? NdviDate { get; set; }
    public List<PrescriptionZoneDto> Zones { get; set; } = [];
}
