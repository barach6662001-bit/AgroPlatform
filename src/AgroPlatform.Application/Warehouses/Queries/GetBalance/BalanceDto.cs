namespace AgroPlatform.Application.Warehouses.Queries.GetBalance;

public class BalanceDto
{
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string ItemCode { get; set; } = string.Empty;
    public Guid? BatchId { get; set; }
    public string? BatchCode { get; set; }
    public decimal BalanceBase { get; set; }
    public string BaseUnit { get; set; } = string.Empty;
    public DateTime LastUpdatedUtc { get; set; }
}
