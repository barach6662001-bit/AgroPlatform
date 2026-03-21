using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;

/// <summary>
/// Ingests a GPS telemetry payload from a Teltonika device webhook.
/// No X-Tenant-Id header is required; the machine is looked up by IMEI across all tenants.
/// Returns the created <see cref="Guid"/> of the <c>GpsTrack</c> record,
/// or <see cref="Guid.Empty"/> if no matching machine was found.
/// </summary>
public record IngestTeltonikaWebhookCommand(
    string Imei,
    double Latitude,
    double Longitude,
    decimal Speed,
    decimal FuelLevel,
    DateTime TimestampUtc
) : IRequest<Guid>;
