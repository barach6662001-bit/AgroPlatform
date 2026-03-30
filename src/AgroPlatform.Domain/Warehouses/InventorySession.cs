using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Warehouses;

public class InventorySession : AuditableEntity
{
    public Guid WarehouseId { get; set; }
    public InventorySessionStatus Status { get; set; } = InventorySessionStatus.InProgress;
    public string? Notes { get; set; }
    public DateTime? CompletedAtUtc { get; set; }

    public Warehouse Warehouse { get; set; } = null!;
    public ICollection<InventorySessionLine> Lines { get; set; } = new List<InventorySessionLine>();
}
