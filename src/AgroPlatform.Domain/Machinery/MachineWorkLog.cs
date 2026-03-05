using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Machinery;

public class MachineWorkLog : AuditableEntity
{
    public Guid MachineId { get; set; }
    public DateTime Date { get; set; }
    public decimal HoursWorked { get; set; }
    public Guid? AgroOperationId { get; set; }
    public string? Description { get; set; }

    public Machine Machine { get; set; } = null!;
}
