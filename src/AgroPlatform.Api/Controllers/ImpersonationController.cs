using AgroPlatform.Api.SuperAdmin;
using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Super-admin impersonation endpoints (PR #614).
///
/// <para><c>POST /api/admin/impersonate</c> requires a super-admin caller and is gated by
/// <see cref="SuperAdminRequiredAttribute"/>.</para>
///
/// <para><c>POST /api/admin/impersonate/end</c> is callable from a token where
/// <c>is_super_admin=false</c> (the active impersonation token sets this), so it cannot
/// share the controller-level <c>[SuperAdminRequired]</c>. It is authorized by the presence
/// of the <c>impersonated_by_user_id</c> claim — handled inside the service.</para>
/// </summary>
[ApiController]
[Authorize]
[Route("api/admin/impersonate")]
[Produces("application/json")]
public sealed class ImpersonationController : ControllerBase
{
    private readonly IImpersonationService _impersonation;

    public ImpersonationController(IImpersonationService impersonation)
    {
        _impersonation = impersonation;
    }

    public sealed record StartImpersonationRequest(string TargetUserId, string Reason);

    [HttpPost("")]
    [SuperAdminRequired]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Start([FromBody] StartImpersonationRequest req, CancellationToken ct)
    {
        if (req is null) return BadRequest(new { error = "Body is required." });
        try
        {
            var result = await _impersonation.StartAsync(req.TargetUserId, req.Reason, ct);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("Rate limit", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("end")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> End(CancellationToken ct)
    {
        try
        {
            var result = await _impersonation.EndAsync(ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
