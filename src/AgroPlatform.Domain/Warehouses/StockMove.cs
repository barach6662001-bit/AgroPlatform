using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Warehouses;

public class StockMove : AuditableEntity
{
    public Guid WarehouseId { get; set; }
    public Guid ItemId { get; set; }
    public Guid? BatchId { get; set; }
    public Guid? OperationId { get; set; }
    public StockMoveType MoveType { get; set; }
    public decimal Quantity { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public decimal QuantityBase { get; set; }
    public string? Note { get; set; }
    public string? ClientOperationId { get; set; }
    public decimal? TotalCost { get; set; }

    public Warehouse Warehouse { get; set; } = null!;
    public WarehouseItem Item { get; set; } = null!;
    public Batch? Batch { get; set; }
}
