namespace AgroPlatform.Application.AgroOperations.DTOs;

public class AgroOperationResourceDto
{
    public Guid Id { get; set; }
    public Guid WarehouseItemId { get; set; }
    public string WarehouseItemName { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public Guid? StockMoveId { get; set; }
    public decimal PlannedQuantity { get; set; }
    public decimal? ActualQuantity { get; set; }
    public string UnitCode { get; set; } = string.Empty;
}
