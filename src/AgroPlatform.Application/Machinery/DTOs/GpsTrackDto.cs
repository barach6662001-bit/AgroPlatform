namespace AgroPlatform.Application.Machinery.DTOs;

public class GpsTrackDto
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public double Lat { get; set; }
    public double Lng { get; set; }
    public decimal Speed { get; set; }
    public decimal FuelLevel { get; set; }
    public DateTime Timestamp { get; set; }
}
