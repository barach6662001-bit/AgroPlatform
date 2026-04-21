using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Warehouses;

public class InventorySessionLine : AuditableEntity
{
    public Guid InventorySessionId { get; set; }
    public Guid ItemId { get; set; }
    public Guid? BatchId { get; set; }
    public decimal ExpectedQuantityBase { get; set; }
    public decimal? ActualQuantityBase { get; set; }
    public string BaseUnit { get; set; } = string.Empty;
    public string? Note { get; set; }
    public bool IsCountRecorded { get; set; }

    public InventorySession Session { get; set; } = null!;
    public WarehouseItem Item { get; set; } = null!;
}
