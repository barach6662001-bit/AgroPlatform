using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;
using NetTopologySuite.Geometries;

namespace AgroPlatform.Domain.Fields;

public class Field : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? CadastralNumber { get; set; }
    public decimal AreaHectares { get; set; }
    public CropType? CurrentCrop { get; set; }
    public int? CurrentCropYear { get; set; }
    public string? GeoJson { get; set; }
    public Geometry? Geometry { get; set; }
    public string? SoilType { get; set; }
    public string? Notes { get; set; }
    public LandOwnershipType OwnershipType { get; set; } = LandOwnershipType.OwnLand;

    // Cadastre integration
    public decimal? CadastralArea { get; set; }        // площа в га з кадастру
    public string? CadastralPurpose { get; set; }       // цільове призначення
    public string? CadastralOwnership { get; set; }     // форма власності (Приватна, Державна, Комунальна)
    public DateTime? CadastralFetchedAt { get; set; }   // коли востаннє підтягнули дані

    public ICollection<FieldCropHistory> CropHistory { get; set; } = new List<FieldCropHistory>();
    public ICollection<AgroOperation> Operations { get; set; } = new List<AgroOperation>();
    public ICollection<CropRotationPlan> RotationPlans { get; set; } = new List<CropRotationPlan>();
    public ICollection<LandLease> LandLeases { get; set; } = new List<LandLease>();
    public ICollection<FieldSeeding> Seedings { get; set; } = new List<FieldSeeding>();
    public ICollection<FieldFertilizer> Fertilizers { get; set; } = new List<FieldFertilizer>();
    public ICollection<FieldProtection> Protections { get; set; } = new List<FieldProtection>();
    public ICollection<FieldHarvest> Harvests { get; set; } = new List<FieldHarvest>();
    public ICollection<FieldZone> Zones { get; set; } = new List<FieldZone>();
    public ICollection<SoilAnalysis> SoilAnalyses { get; set; } = new List<SoilAnalysis>();
}
