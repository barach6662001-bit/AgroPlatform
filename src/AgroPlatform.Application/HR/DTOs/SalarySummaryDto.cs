namespace AgroPlatform.Application.HR.DTOs;

public class SalarySummaryDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeFullName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public decimal TotalAccrued { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal Debt { get; set; }
}
