using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.HR;

public class WorkLog : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public DateTime WorkDate { get; set; }
    public decimal? HoursWorked { get; set; }
    public decimal? UnitsProduced { get; set; }
    public string? WorkDescription { get; set; }
    public Guid? FieldId { get; set; }
    public Guid? OperationId { get; set; }
    public decimal AccruedAmount { get; set; }
    public bool IsPaid { get; set; } = false;
}
