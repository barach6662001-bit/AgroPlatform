using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Machinery;

public class GpsTrack : AuditableEntity
{
    public Guid VehicleId { get; set; }
    public double Lat { get; set; }
    public double Lng { get; set; }
    public decimal Speed { get; set; }
    public decimal FuelLevel { get; set; }
    public DateTime Timestamp { get; set; }

    public Machine Vehicle { get; set; } = null!;
}
