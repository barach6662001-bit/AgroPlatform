namespace AgroPlatform.Application.Warehouses.Queries.GetWarehouseItems;

public class WarehouseItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string BaseUnit { get; set; } = string.Empty;
    public string? Description { get; set; }
}
