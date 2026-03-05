using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Warehouses;

public class Batch : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public Guid ItemId { get; set; }

    public WarehouseItem Item { get; set; } = null!;
}
