namespace AgroPlatform.Application.Analytics.DTOs;

public class ResourceConsumptionDto
{
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal TotalConsumed { get; set; }
    public string UnitCode { get; set; } = string.Empty;
}
