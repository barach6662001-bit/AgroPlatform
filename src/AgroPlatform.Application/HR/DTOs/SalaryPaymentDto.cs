namespace AgroPlatform.Application.HR.DTOs;

public class SalaryPaymentDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentType { get; set; } = "Salary";
    public string? Notes { get; set; }
}
