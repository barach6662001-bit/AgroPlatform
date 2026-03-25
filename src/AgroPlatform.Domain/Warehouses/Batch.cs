using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Warehouses;

public class Batch : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public Guid ItemId { get; set; }

    public DateTime ReceivedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? SupplierName { get; set; }
    public decimal? CostPerUnit { get; set; }

    public WarehouseItem Item { get; set; } = null!;
}

