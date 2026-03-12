using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Machinery;

public class MaintenanceRecord : AuditableEntity
{
    public Guid MachineId { get; set; }
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty;   // "Scheduled" | "Repair" | "Inspection"
    public string? Description { get; set; }
    public decimal? Cost { get; set; }
    public decimal? HoursAtMaintenance { get; set; }

    public Machine Machine { get; set; } = null!;
}
