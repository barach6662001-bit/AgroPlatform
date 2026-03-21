using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;

/// <summary>
/// Raw GPS ingestion command from a Teltonika-compatible tracker.
/// </summary>
public record IngestTeltonikaWebhookCommand(
    string Imei,
    double Lat,
    double Lng,
    decimal Speed,
    DateTime Timestamp
) : IRequest<Guid>;
