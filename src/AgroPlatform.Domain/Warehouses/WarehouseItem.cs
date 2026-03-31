using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Warehouses;

public class WarehouseItem : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string BaseUnit { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? MinimumQuantity { get; set; }
    public decimal? PurchasePrice { get; set; }

    /// <summary>Optional FK to the ItemCategories reference table (TASK-015).</summary>
    public Guid? CategoryId { get; set; }
    public ItemCategory? ItemCategory { get; set; }
}
