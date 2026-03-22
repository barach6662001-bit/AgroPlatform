using AgroPlatform.Application.Machinery.Commands.IngestGpsWebhook;
using AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;
using AgroPlatform.Application.Machinery.DTOs;
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
    /// Receives a generic GPS telemetry payload from any GPS tracker device.
    /// The device is identified by <c>deviceId</c>, which is matched against
    /// <c>Machine.ImeiNumber</c>. No authentication or tenant header is required.
    /// Returns the ID of the created GpsTrack, or <c>Guid.Empty</c> if the device is unknown.
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Webhook(
        [FromBody] GpsWebhookDto dto,
        CancellationToken cancellationToken)
    {
        var command = new IngestGpsWebhookCommand(
            DeviceId: dto.DeviceId,
            Lat: dto.Lat,
            Lon: dto.Lon,
            Speed: dto.Speed,
            Timestamp: dto.Timestamp,
            Fuel: dto.Fuel,
            Heading: dto.Heading);

        var trackId = await _sender.Send(command, cancellationToken);
        return Accepted(new { id = trackId });
    }

    /// <summary>
    /// Receives a GPS telemetry payload from a Teltonika device.
    /// This endpoint is anonymous: no authentication or tenant header is required.
    /// Returns the ID of the created GpsTrack, or Guid.Empty if the IMEI is unknown.
    /// </summary>
    [HttpPost("webhook/teltonika")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TeltonikaWebhook(
        [FromBody] IngestTeltonikaWebhookCommand command,
        CancellationToken cancellationToken)
    {
        var trackId = await _sender.Send(command, cancellationToken);
        return Ok(new { id = trackId });
    }
}
