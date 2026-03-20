namespace AgroPlatform.Application.Economics.DTOs;

public class SaleKpiDto
{
    public decimal TotalRevenue { get; set; }
    public decimal AveragePricePerTon { get; set; }
    public string? TopBuyer { get; set; }
    public decimal TopBuyerRevenue { get; set; }
    public int TotalSalesCount { get; set; }
    public decimal TotalQuantityTons { get; set; }
}
