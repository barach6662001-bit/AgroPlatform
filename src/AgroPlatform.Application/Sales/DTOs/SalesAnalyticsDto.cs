namespace AgroPlatform.Application.Sales.DTOs;

public class SalesAnalyticsDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalSalesCount { get; set; }
    public List<ProductRevenueDto> ByProduct { get; set; } = new();
    public List<BuyerRevenueDto> ByBuyer { get; set; } = new();
    public List<MonthlyRevenueDto> ByMonth { get; set; } = new();
}

public class ProductRevenueDto
{
    public string Product { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal TotalQuantity { get; set; }
}

public class BuyerRevenueDto
{
    public string BuyerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int SalesCount { get; set; }
}

public class MonthlyRevenueDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalAmount { get; set; }
    public int SalesCount { get; set; }
}
