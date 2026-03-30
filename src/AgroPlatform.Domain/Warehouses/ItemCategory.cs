using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Warehouses;

public class ItemCategory : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public Guid? ParentId { get; set; }

    public ItemCategory? Parent { get; set; }
    public ICollection<ItemCategory> Children { get; set; } = new List<ItemCategory>();
    public ICollection<WarehouseItem> Items { get; set; } = new List<WarehouseItem>();
}
