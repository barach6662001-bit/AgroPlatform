using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.HR;

public class WorkLog : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public decimal HoursWorked { get; set; }
    public string? Description { get; set; }

    public Employee Employee { get; set; } = null!;
}
