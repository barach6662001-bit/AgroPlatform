using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Machinery;

public class Machine : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string InventoryNumber { get; set; } = string.Empty;
    public MachineryType Type { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    public MachineryStatus Status { get; set; } = MachineryStatus.Active;
    public FuelType FuelType { get; set; }
    public decimal? FuelConsumptionPerHour { get; set; }

    public ICollection<MachineWorkLog> WorkLogs { get; set; } = new List<MachineWorkLog>();
    public ICollection<FuelLog> FuelLogs { get; set; } = new List<FuelLog>();
}
