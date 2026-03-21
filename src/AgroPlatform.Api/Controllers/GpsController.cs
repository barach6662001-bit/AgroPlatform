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
