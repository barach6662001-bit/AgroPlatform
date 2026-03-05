using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Warehouses.DTOs;

public class StockMoveDto
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public Guid ItemId { get; set; }
    public StockMoveType MoveType { get; set; }
    public decimal Quantity { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public string? Note { get; set; }
}
