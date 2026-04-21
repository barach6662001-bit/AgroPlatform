using System.ComponentModel.DataAnnotations;
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
    public DateTime? NextMaintenanceDate { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public decimal? MaintenanceIntervalHours { get; set; }

    public string? ImeiNumber { get; set; }

    public Guid? AssignedDriverId { get; set; }
    public string? AssignedDriverName { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public ICollection<MachineWorkLog> WorkLogs { get; set; } = new List<MachineWorkLog>();
    public ICollection<FuelLog> FuelLogs { get; set; } = new List<FuelLog>();
    public ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = new List<MaintenanceRecord>();
}
