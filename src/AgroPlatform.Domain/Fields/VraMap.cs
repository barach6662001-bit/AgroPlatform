using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class VraMap : AuditableEntity
{
    public Guid FieldId { get; set; }
    public Field Field { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string FertilizerName { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? Notes { get; set; }

    public ICollection<VraZone> Zones { get; set; } = new List<VraZone>();
}
