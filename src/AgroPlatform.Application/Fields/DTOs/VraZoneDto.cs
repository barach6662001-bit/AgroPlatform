namespace AgroPlatform.Application.Fields.DTOs;

public class VraZoneDto
{
    public Guid Id { get; set; }
    public int ZoneIndex { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public decimal? NdviValue { get; set; }
    public decimal? SoilOrganicMatter { get; set; }
    public decimal? SoilNitrogen { get; set; }
    public decimal? SoilPhosphorus { get; set; }
    public decimal? SoilPotassium { get; set; }
    public decimal AreaHectares { get; set; }
    public decimal RateKgPerHa { get; set; }
    public string Color { get; set; } = "#cccccc";
}
