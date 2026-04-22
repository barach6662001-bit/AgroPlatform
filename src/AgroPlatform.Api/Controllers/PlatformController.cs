using AgroPlatform.Application.Platform.Queries.GetPlatformStats;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>Platform-wide aggregate endpoints — SuperAdmin only.</summary>
[ApiController]
[Authorize(Policy = Permissions.Platform.SuperAdmin)]
[Route("api/platform")]
[Produces("application/json")]
public class PlatformController : ControllerBase
{
    private readonly ISender _sender;

    public PlatformController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns cross-tenant KPIs for the SuperAdmin control center.</summary>
    [HttpGet("stats")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetPlatformStatsQuery(), cancellationToken);
        return Ok(result);
    }
}
