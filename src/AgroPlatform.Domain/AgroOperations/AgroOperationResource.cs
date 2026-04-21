using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Warehouses;

namespace AgroPlatform.Domain.AgroOperations;

public class AgroOperationResource : AuditableEntity
{
    public Guid AgroOperationId { get; set; }
    public Guid WarehouseItemId { get; set; }
    public Guid WarehouseId { get; set; }
    public Guid? StockMoveId { get; set; }
    public decimal PlannedQuantity { get; set; }
    public decimal? ActualQuantity { get; set; }
    public string UnitCode { get; set; } = string.Empty;

    public AgroOperation AgroOperation { get; set; } = null!;
    public WarehouseItem WarehouseItem { get; set; } = null!;
}
