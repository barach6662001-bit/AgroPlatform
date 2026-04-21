using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Warehouses.DTOs;

public class StockMoveDto
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public StockMoveType MoveType { get; set; }
    public decimal Quantity { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public decimal QuantityBase { get; set; }
    public Guid? BatchId { get; set; }
    public string? BatchCode { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
