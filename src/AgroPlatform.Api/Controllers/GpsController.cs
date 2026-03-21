using AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Receives GPS telemetry from hardware trackers.
/// </summary>
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
    /// Receives a Teltonika GPS device webhook payload and persists the track point if the IMEI is recognized.
    /// </summary>
    /// <remarks>
    /// <para>
    /// Authentication is not required; this endpoint is called directly by the Teltonika
    /// device provider without any tenant context.
    /// </para>
    /// <para>
    /// If the IMEI matches a known machine the track is persisted and
    /// a real-time position update is broadcast via the Fleet SignalR hub.
    /// Returns <c>200 OK</c> with the new GPS track id.
    /// </para>
    /// <para>
    /// If the IMEI is <b>unknown</b> no track is persisted and
    /// <c>200 OK</c> is returned with <see cref="Guid.Empty"/> as the id.
    /// </para>
    /// </remarks>
    /// <param name="command">Telemetry payload from the device.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The id of the created GPS track, or <see cref="Guid.Empty"/> for an unknown IMEI.</returns>
    [HttpPost("webhook/teltonika")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TeltonikaWebhook(
        [FromBody] IngestTeltonikaWebhookCommand command,
        CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return Ok(new { id });
    }
}
