using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.HR;

public class SalaryPayment : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentType { get; set; } = "Salary"; // "Salary" or "Advance"
    public string? Notes { get; set; }
}
