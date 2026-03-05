using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Warehouses;

public class StockBalance : BaseEntity
{
    public Guid WarehouseId { get; set; }
    public Guid ItemId { get; set; }
    public Guid? BatchId { get; set; }
    public decimal BalanceBase { get; set; }
    public string BaseUnit { get; set; } = string.Empty;
    public DateTime LastUpdatedUtc { get; set; }
}
