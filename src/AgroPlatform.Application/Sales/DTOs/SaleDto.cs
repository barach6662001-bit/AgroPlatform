namespace AgroPlatform.Application.Sales.DTOs;

public class SaleDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public string Product { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "т";
    public decimal PricePerUnit { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "UAH";
    public Guid? FieldId { get; set; }
    public string? Notes { get; set; }
    public Guid? GrainMovementId { get; set; }
}
