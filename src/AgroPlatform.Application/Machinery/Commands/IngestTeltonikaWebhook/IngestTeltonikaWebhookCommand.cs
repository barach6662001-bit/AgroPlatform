using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;

/// <summary>
/// Ingests a Teltonika GPS device webhook payload.
/// Authentication is not required; the request arrives from the device provider.
/// </summary>
/// <param name="Imei">15-digit numeric IMEI of the sending GPS tracker.</param>
/// <param name="Lat">Latitude in decimal degrees (WGS-84).</param>
/// <param name="Lng">Longitude in decimal degrees (WGS-84).</param>
/// <param name="Speed">Ground speed in km/h.</param>
/// <param name="FuelLevel">Fuel level in litres.</param>
/// <param name="TimestampUtc">UTC time of the telemetry reading.</param>
public record IngestTeltonikaWebhookCommand(
    string Imei,
    double Lat,
    double Lng,
    double Speed,
    double FuelLevel,
    DateTime TimestampUtc) : IRequest<Guid>;
