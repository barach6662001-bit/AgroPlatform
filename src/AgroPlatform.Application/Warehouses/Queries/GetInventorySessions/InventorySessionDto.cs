using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Warehouses.Queries.GetInventorySessions;

public class InventorySessionDto
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public InventorySessionStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public int TotalLines { get; set; }
    public int CountedLines { get; set; }
}
