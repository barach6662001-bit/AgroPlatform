namespace AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;

public class InventoryAdjustResultDto
{
    public Guid? MoveId { get; set; }
    public decimal AdjustmentAmount { get; set; }
}
