namespace AgroPlatform.Application.HR.DTOs;

public class SalarySummaryItemDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal TotalAccrued { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal Debt => TotalAccrued - TotalPaid;
}

public class SalarySummaryDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public IReadOnlyList<SalarySummaryItemDto> Items { get; set; } = [];
    public decimal TotalAccrued => Items.Sum(i => i.TotalAccrued);
    public decimal TotalPaid => Items.Sum(i => i.TotalPaid);
    public decimal TotalDebt => Items.Sum(i => i.Debt);
}
