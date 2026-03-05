using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Machinery;

namespace AgroPlatform.Domain.AgroOperations;

public class AgroOperationMachinery : AuditableEntity
{
    public Guid AgroOperationId { get; set; }
    public Guid MachineId { get; set; }
    public decimal? HoursWorked { get; set; }
    public decimal? FuelUsed { get; set; }
    public string? OperatorName { get; set; }

    public AgroOperation AgroOperation { get; set; } = null!;
    public Machine Machine { get; set; } = null!;
}
