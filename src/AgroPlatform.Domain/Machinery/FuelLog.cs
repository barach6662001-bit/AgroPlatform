using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Machinery;

public class FuelLog : AuditableEntity
{
    public Guid MachineId { get; set; }
    public DateTime Date { get; set; }
    public decimal Quantity { get; set; }
    public FuelType FuelType { get; set; }
    public string? Note { get; set; }

    public Machine Machine { get; set; } = null!;
}
