using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.IngestGpsWebhook;

/// <summary>
/// Generic GPS webhook ingestion command.
/// Resolves the machine by <see cref="DeviceId"/> (matched against <c>Machine.ImeiNumber</c>),
/// persists a <c>GpsTrack</c> record, and broadcasts a live position update via the fleet
/// SignalR hub.
/// Returns the created <see cref="Guid"/> of the GpsTrack, or <see cref="Guid.Empty"/> if
/// no machine with the given device identifier was found.
/// </summary>
public record IngestGpsWebhookCommand(
    string DeviceId,
    double Lat,
    double Lon,
    decimal Speed,
    DateTime Timestamp,
    decimal? Fuel,
    double? Heading
) : IRequest<Guid>;
