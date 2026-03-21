using AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Route("api/gps")]
[Produces("application/json")]
public class GpsController : ControllerBase
{
    private readonly ISender _sender;

    public GpsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Receives a raw GPS position report from a Teltonika-compatible tracker.
    /// Stores the data as a <c>GpsTrack</c> and broadcasts a real-time update
    /// to connected SignalR clients via <c>FleetHub</c>.
    /// </summary>
    /// <remarks>
    /// First-version raw ingestion — device authentication is intentionally minimal.
    /// The IMEI is used to resolve the associated machine; if no machine is found the
    /// track is still persisted for audit purposes.
    /// </remarks>
    [HttpPost("webhook/teltonika")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TeltonikaWebhook(
        [FromBody] TeltonikaPayload payload,
        CancellationToken cancellationToken)
    {
        var command = new IngestTeltonikaWebhookCommand(
            Imei: payload.Imei,
            Lat: payload.Lat,
            Lng: payload.Lng,
            Speed: payload.Speed,
            Timestamp: payload.Timestamp
        );

        var trackId = await _sender.Send(command, cancellationToken);
        return Ok(new { id = trackId });
    }
}

/// <summary>Teltonika webhook payload.</summary>
public sealed class TeltonikaPayload
{
    /// <summary>Device IMEI (15 digits).</summary>
    public string Imei { get; set; } = string.Empty;

    /// <summary>Latitude in decimal degrees (WGS-84).</summary>
    public double Lat { get; set; }

    /// <summary>Longitude in decimal degrees (WGS-84).</summary>
    public double Lng { get; set; }

    /// <summary>Ground speed in km/h.</summary>
    public decimal Speed { get; set; }

    /// <summary>UTC timestamp of the telemetry reading.</summary>
    public DateTime Timestamp { get; set; }
}
