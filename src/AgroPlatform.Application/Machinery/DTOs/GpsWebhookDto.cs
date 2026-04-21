namespace AgroPlatform.Application.Machinery.DTOs;

/// <summary>
/// Generic GPS tracker webhook payload.
/// Used by <c>POST /api/gps/webhook</c> to ingest position data from any GPS device.
/// </summary>
public class GpsWebhookDto
{
    /// <summary>
    /// Device identifier (e.g., IMEI or other tracker ID).
    /// Resolved to a <see cref="AgroPlatform.Domain.Machinery.Machine"/> via
    /// <c>Machine.ImeiNumber</c>.
    /// </summary>
    public string DeviceId { get; set; } = string.Empty;

    /// <summary>Latitude in decimal degrees (WGS-84). Must be in the range [-90, 90].</summary>
    public double Lat { get; set; }

    /// <summary>Longitude in decimal degrees (WGS-84). Must be in the range [-180, 180].</summary>
    public double Lon { get; set; }

    /// <summary>Ground speed in km/h. Must be non-negative.</summary>
    public decimal Speed { get; set; }

    /// <summary>UTC timestamp of the telemetry reading.</summary>
    public DateTime Timestamp { get; set; }

    /// <summary>Optional fuel level in litres. Must be non-negative when provided.</summary>
    public decimal? Fuel { get; set; }

    /// <summary>Optional heading in degrees clockwise from North (0–360).</summary>
    public double? Heading { get; set; }
}
