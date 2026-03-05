namespace AgroPlatform.Application.Analytics.DTOs;

public class TopStockItemDto
{
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal TotalBalance { get; set; }
    public string BaseUnit { get; set; } = string.Empty;
}
