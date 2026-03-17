using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.HR;

namespace AgroPlatform.Domain.Economics;

public class SalaryPayment : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "UAH";
    public string? Note { get; set; }

    public Employee Employee { get; set; } = null!;
}
