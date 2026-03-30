using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Warehouses.Queries.GetInventorySessionById;

public class InventorySessionDetailDto
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public InventorySessionStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public List<InventorySessionLineDto> Lines { get; set; } = [];
}

public class InventorySessionLineDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string ItemCode { get; set; } = string.Empty;
    public Guid? BatchId { get; set; }
    public decimal ExpectedQuantityBase { get; set; }
    public decimal? ActualQuantityBase { get; set; }
    public string BaseUnit { get; set; } = string.Empty;
    public bool IsCountRecorded { get; set; }
    public string? Note { get; set; }
}
