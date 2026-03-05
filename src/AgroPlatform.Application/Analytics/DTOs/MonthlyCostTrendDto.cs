namespace AgroPlatform.Application.Analytics.DTOs;

public class MonthlyCostTrendDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalAmount { get; set; }
}
