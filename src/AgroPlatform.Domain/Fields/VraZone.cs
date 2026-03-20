using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class VraZone : AuditableEntity
{
    public Guid VraMapId { get; set; }
    public VraMap VraMap { get; set; } = null!;
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
